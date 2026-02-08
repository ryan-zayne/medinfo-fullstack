import { db } from "@medinfo/db";
import { users } from "@medinfo/db/schema/auth";
import { backendApiSchemaRoutes, SignUpSchema } from "@medinfo/shared/validation/backendApiSchema";
import { differenceInHours } from "date-fns";
import { eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { AppError, AppJsonResponse, getValidatedValue } from "@/lib/utils";
import { validateWithZodMiddleware } from "@/middleware";
import { getFromCache, removeFromCache, setCache } from "@/services/cache";
import { uploadStreamToCloudinary } from "@/services/cloudinary";
import { authMiddleware } from "./middleware/authMiddleware";
import { getNecessaryUserDetails, sendVerificationEmail } from "./services/common";
import { deleteCookie, getCookie, setCookie } from "./services/cookie";
import { hashValue, verifyHashedValue } from "./services/hash";
import {
	createGoogleAuthURL,
	findOrCreateUserFromGoogle,
	getUserDetailsFromGoogleAuthClaims,
} from "./services/oauth";
import { generateAccessToken, generateRefreshToken, getUpdatedTokenResultArray } from "./services/token";

const authRoutes = new Hono()
	.basePath("/auth")
	.post("/signup", async (ctx) => {
		const formDataBody = await ctx.req.parseBody();

		const {
			country,
			dob,
			email,
			firstName,
			gender,
			lastName,
			medicalLicense,
			password,
			role,
			specialty,
		} = getValidatedValue(formDataBody as z.infer<typeof SignUpSchema>, SignUpSchema);

		const uploadResult = await uploadStreamToCloudinary(medicalLicense, {
			folder: "medicalCerts",
			resource_type: "auto",
		});

		const medicalLicenseUrl = uploadResult ? uploadResult.secure_url : null;

		const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

		if (existingUser) {
			throw new AppError({ code: 400, message: "User already exists" });
		}

		const passwordHash = await hashValue(password);

		const avatar = `https://avatar.iran.liara.run/public/${gender === "male" ? "boy" : "girl"}`;

		const result = await db.transaction(async (tx) => {
			const [insertedUser] = await tx
				.insert(users)
				.values({
					avatar,
					country,
					dob,
					email,
					firstName,
					fullName: `${firstName} ${lastName}`,
					gender,
					lastName,
					medicalLicense: medicalLicenseUrl,
					passwordHash,
					role,
					specialty,
				})
				.returning();

			if (!insertedUser) {
				throw new AppError({ code: 500, message: "Failed to create user" });
			}

			const newZayneRefreshTokenResult = generateRefreshToken(insertedUser);

			const [updatedUser] = await tx
				.update(users)
				.set({ refreshTokenArray: [newZayneRefreshTokenResult] })
				.where(eq(users.id, insertedUser.id))
				.returning();

			if (!updatedUser) {
				throw new AppError({ code: 500, message: "Failed to update user tokens" });
			}

			return { newUser: updatedUser, newZayneRefreshTokenResult };
		});

		await Promise.all([
			sendVerificationEmail(result.newUser),
			setCache(`user:${result.newUser.id}`, result.newUser),
		]);

		const newZayneAccessTokenResult = generateAccessToken(result.newUser);

		setCookie(ctx, {
			expires: newZayneAccessTokenResult.expiresAt,
			name: "zayneAccessToken",
			value: newZayneAccessTokenResult.token,
		});

		setCookie(ctx, {
			expires: result.newZayneRefreshTokenResult.expiresAt,
			name: "zayneRefreshToken",
			value: result.newZayneRefreshTokenResult.token,
		});

		return AppJsonResponse(ctx, {
			data: {
				tokens: { access: newZayneAccessTokenResult, refresh: result.newZayneRefreshTokenResult },
				user: getNecessaryUserDetails(result.newUser),
			},
			message: "Account created successfully",
			schema: backendApiSchemaRoutes["@post/auth/signup"].data,
		});
	})
	.post(
		"/signin",
		validateWithZodMiddleware("json", backendApiSchemaRoutes["@post/auth/signin"].body),
		async (ctx) => {
			const { email, password } = ctx.req.valid("json");

			const [currentUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

			if (!currentUser) {
				throw new AppError({
					cause: "No user found",
					code: 401,
					message: "Email or password is incorrect",
				});
			}

			if (!currentUser.passwordHash) {
				let message = "No password provided for this account. Try resetting the password";

				currentUser.googleId
					&& (message =
						"This account uses Google sign-in. Please sign in with Google or reset your password");

				throw new AppError({
					code: 401,
					message,
				});
			}

			const isValidPassword = await verifyHashedValue(currentUser.passwordHash, password);

			if (!isValidPassword) {
				// == For every time the password is gotten wrong, increment the login retry count by 1
				await db
					.update(users)
					.set({ loginRetryCount: sql`${users.loginRetryCount} + 1` })
					.where(eq(users.id, currentUser.id));

				throw new AppError({
					cause: "Invalid password",
					code: 401,
					message: "Email or password is incorrect",
				});
			}

			if (!currentUser.emailVerifiedAt) {
				await sendVerificationEmail(currentUser);
			}

			if (currentUser.suspendedAt) {
				throw new AppError({
					code: 401,
					message: "Your account is currently suspended",
				});
			}

			const hoursSinceLastLogin = differenceInHours(new Date(), currentUser.lastLoginAt);

			// == Check if user has exceeded login retries (3 times in 12 hours)
			if (currentUser.loginRetryCount >= 3 && hoursSinceLastLogin < 12) {
				// TODO: send reset password email to user

				throw new AppError({
					code: 401,
					message: "Login retries exceeded",
				});
			}

			const zayneRefreshToken = getCookie(ctx, "zayneRefreshToken");

			const newZayneRefreshTokenResult = generateRefreshToken(currentUser);

			const [updatedUser] = await db
				.update(users)
				.set({
					lastLoginAt: new Date(),
					loginRetryCount: 0,
					refreshTokenArray: [
						...getUpdatedTokenResultArray({ currentUser, zayneRefreshToken }),
						newZayneRefreshTokenResult,
					],
				})
				.where(eq(users.id, currentUser.id))
				.returning();

			if (!updatedUser) {
				throw new AppError({
					code: 500,
					message: "Signin failed successfully",
				});
			}

			await setCache(`user:${updatedUser.id}`, updatedUser);

			const newZayneAccessTokenResult = generateAccessToken(currentUser);

			setCookie(ctx, {
				expires: newZayneAccessTokenResult.expiresAt,
				name: "zayneAccessToken",
				value: newZayneAccessTokenResult.token,
			});

			setCookie(ctx, {
				expires: newZayneRefreshTokenResult.expiresAt,
				name: "zayneRefreshToken",
				value: newZayneRefreshTokenResult.token,
			});

			return AppJsonResponse(ctx, {
				data: {
					tokens: { access: newZayneAccessTokenResult, refresh: newZayneRefreshTokenResult },
					user: getNecessaryUserDetails(updatedUser),
				},
				message: "Signed in successfully",
				schema: backendApiSchemaRoutes["@post/auth/signin"].data,
			});
		}
	)
	.get(
		"/google",
		validateWithZodMiddleware("query", backendApiSchemaRoutes["@get/auth/google"].query),
		(ctx) => {
			const { role } = ctx.req.valid("query");

			if (role !== "patient") {
				throw new AppError({
					code: 401,
					message: "Only patients are allowed to signup with google",
				});
			}

			const { authURL, codeVerifier, cookiesExpireAt, state } = createGoogleAuthURL();

			setCookie(ctx, {
				expires: cookiesExpireAt,
				name: "google_code_verifier",
				value: codeVerifier,
			});

			setCookie(ctx, {
				expires: cookiesExpireAt,
				name: "google_oauth_state",
				value: state,
			});

			return AppJsonResponse(ctx, {
				data: { authURL },
				message: "Google Oauth initialized successfully",
				schema: backendApiSchemaRoutes["@get/auth/google"].data,
			});
		}
	)
	.get(
		"/google/callback",
		validateWithZodMiddleware("query", backendApiSchemaRoutes["@get/auth/google/callback"].query),
		async (ctx) => {
			const { code, state } = ctx.req.valid("query");

			const codeVerifier = getCookie(ctx, "google_code_verifier");

			const stateCookie = getCookie(ctx, "google_oauth_state");

			if (!code || !state || !codeVerifier || !stateCookie) {
				throw new AppError({
					code: 400,
					message: "Invalid Request. Please restart the process",
				});
			}

			if (state !== stateCookie) {
				throw new AppError({
					code: 400,
					message: "Invalid State",
				});
			}

			const userDetails = await getUserDetailsFromGoogleAuthClaims(code, codeVerifier);

			deleteCookie(ctx, "google_oauth_state");

			deleteCookie(ctx, "google_code_verifier");

			const result = await db.transaction(async (tx) => {
				const { redirectURL, user, variant } = await findOrCreateUserFromGoogle(
					userDetails,
					tx as unknown as typeof db
				);

				const newZayneRefreshTokenResult = generateRefreshToken(user);

				const [updatedUser] = await tx
					.update(users)
					.set(
						variant === "new-user" ?
							{ refreshTokenArray: [newZayneRefreshTokenResult] }
						:	{
								refreshTokenArray: [
									...getUpdatedTokenResultArray({
										currentUser: user,
										zayneRefreshToken: getCookie(ctx, "zayneRefreshToken"),
									}),
									newZayneRefreshTokenResult,
								],
							}
					)
					.where(eq(users.id, user.id))
					.returning();

				if (!updatedUser) {
					throw new AppError({ code: 500, message: "Failed to update user tokens" });
				}

				return {
					newZayneRefreshTokenResult,
					redirectURL,
					updatedUser,
				};
			});

			const newZayneAccessTokenResult = generateAccessToken(result.updatedUser);

			setCookie(ctx, {
				expires: newZayneAccessTokenResult.expiresAt,
				name: "zayneAccessToken",
				value: newZayneAccessTokenResult.token,
			});

			setCookie(ctx, {
				expires: result.newZayneRefreshTokenResult.expiresAt,
				name: "zayneRefreshToken",
				value: result.newZayneRefreshTokenResult.token,
			});

			await setCache(`user:${result.updatedUser.id}`, result.updatedUser);

			return ctx.redirect(result.redirectURL);
		}
	)
	.post(
		"/verify-email",
		validateWithZodMiddleware("json", backendApiSchemaRoutes["@post/auth/verify-email"].body),
		async (ctx) => {
			const { code, userId } = ctx.req.valid("json");

			const cachedHashedCode = await getFromCache<string>(`verify-email-code:${userId}`);

			if (!cachedHashedCode) {
				throw new AppError({
					code: 400,
					message: "Invalid or expired verification code",
				});
			}

			const isCodeValid = await verifyHashedValue(cachedHashedCode, code);

			if (!isCodeValid) {
				throw new AppError({
					code: 400,
					message: "Invalid verification code",
				});
			}

			await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.id, userId));

			await removeFromCache(`verify-email-code:${userId}`);

			return AppJsonResponse(ctx, {
				data: null,
				message: "Account successfully verified!",
				schema: backendApiSchemaRoutes["@post/auth/verify-email"].data,
			});
		}
	)
	.get("/signout", authMiddleware, async (ctx) => {
		const zayneRefreshToken = getCookie(ctx, "zayneRefreshToken");

		const currentUser = ctx.get("currentUser");

		await Promise.all([
			db
				.update(users)
				.set({ refreshTokenArray: getUpdatedTokenResultArray({ currentUser, zayneRefreshToken }) })
				.where(eq(users.id, currentUser.id)),
			removeFromCache(`user:${currentUser.id}`),
		]);

		deleteCookie(ctx, "zayneAccessToken");

		deleteCookie(ctx, "zayneRefreshToken");

		return AppJsonResponse(ctx, {
			data: null,
			message: "Signed out successfully",
			schema: backendApiSchemaRoutes["@get/auth/signout"].data,
		});
	})
	.get("/session", authMiddleware, (ctx) => {
		const currentUser = ctx.get("currentUser");

		return AppJsonResponse(ctx, {
			data: { user: getNecessaryUserDetails(currentUser) },
			message: "Session fetched successfully",
			schema: backendApiSchemaRoutes["@get/auth/session"].data,
		});
	});

export { authRoutes };
