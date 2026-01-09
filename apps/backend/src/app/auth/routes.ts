import { db } from "@medinfo/db";
import { users } from "@medinfo/db/schema/auth";
import { backendApiSchemaRoutes, SignUpSchema } from "@medinfo/shared/validation/backendApiSchema";
import { differenceInHours } from "date-fns";
import { eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { AppError, AppJsonResponse, getValidatedValue } from "@/lib/utils";
import { validateWithZodMiddleware } from "@/middleware";
import { uploadStreamToCloudinary } from "@/services/cloudinary";
import { authMiddleware } from "./middleware/authMiddleware";
import { getNecessaryUserDetails } from "./services/common";
import { deleteCookie, getCookie, setCookie } from "./services/cookie";
import { hashValue, verifyHashedValue } from "./services/hash";
import {
	createGoogleAuthURL,
	findOrCreateUserFromGoogle,
	getUserInfoFromGoogleAuthClaims,
} from "./services/oauth";
import { generateAccessToken, generateRefreshToken, getUpdatedTokenArray } from "./services/token";

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

		const [newUser] = await db
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

		if (!newUser) {
			throw new AppError({ code: 500, message: "Failed to create user" });
		}

		const newZayneRefreshTokenResult = generateRefreshToken(newUser);

		await db
			.update(users)
			.set({ refreshTokenArray: [newZayneRefreshTokenResult] })
			.where(eq(users.id, newUser.id));

		const newZayneAccessTokenResult = generateAccessToken(newUser);

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

		// TODO: Send Verification email

		return AppJsonResponse(ctx, {
			data: {
				tokens: { access: newZayneAccessTokenResult, refresh: newZayneRefreshTokenResult },
				user: getNecessaryUserDetails(newUser),
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
				await db.update(users).set({ loginRetryCount: sql`${users.loginRetryCount} + 1` });

				throw new AppError({
					cause: "Invalid password",
					code: 401,
					message: "Email or password is incorrect",
				});
			}

			if (!currentUser.emailVerifiedAt) {
				// TODO send verification email
			}

			if (currentUser.suspendedAt) {
				throw new AppError({
					code: 401,
					message: "Your account is currently suspended",
				});
			}

			const NOW = new Date();

			const hoursSinceLastLogin = differenceInHours(NOW, currentUser.lastLoginAt);

			// == Check if user has exceeded login retries (3 times in 12 hours)
			if (currentUser.loginRetryCount >= 3 && hoursSinceLastLogin < 12) {
				throw new AppError({
					code: 401,
					message: "Login retries exceeded",
				});

				// TODO: send reset password email to user
			}

			const zayneRefreshToken = getCookie(ctx, "zayneRefreshToken");

			const newZayneRefreshTokenResult = generateRefreshToken(currentUser);

			const updatedTokenArray = getUpdatedTokenArray({ currentUser, zayneRefreshToken });

			const [updatedUser] = await db
				.update(users)
				.set({
					lastLoginAt: new Date(),
					loginRetryCount: 0,
					refreshTokenArray: [...updatedTokenArray, newZayneRefreshTokenResult],
				})
				.where(eq(users.id, currentUser.id))
				.returning();

			if (!updatedUser) {
				throw new AppError({
					code: 500,
					message: "Signin failed successfully",
				});
			}

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

			const userInfo = await getUserInfoFromGoogleAuthClaims(code, codeVerifier);

			deleteCookie(ctx, "google_oauth_state");

			deleteCookie(ctx, "google_code_verifier");

			const { redirectURL, user, userVariant } = await findOrCreateUserFromGoogle(userInfo);

			const newZayneRefreshTokenResult = generateRefreshToken(user);

			const newZayneAccessTokenResult = generateAccessToken(user);

			if (userVariant === "existing") {
				const existingUser = user;

				const zayneRefreshToken = getCookie(ctx, "zayneRefreshToken");

				const updatedTokenArray = getUpdatedTokenArray({
					currentUser: existingUser,
					zayneRefreshToken,
				});

				await db
					.update(users)
					.set({
						lastLoginAt: new Date(),
						loginRetryCount: 0,
						refreshTokenArray: [...updatedTokenArray, newZayneRefreshTokenResult],
					})
					.where(eq(users.id, existingUser.id));
			}

			if (userVariant === "new") {
				const newUser = user;

				await db
					.update(users)
					.set({ refreshTokenArray: [newZayneRefreshTokenResult] })
					.where(eq(users.id, newUser.id));
			}

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

			return ctx.redirect(redirectURL);
		}
	)
	.get("/signout", authMiddleware, async (ctx) => {
		const zayneRefreshToken = getCookie(ctx, "zayneRefreshToken");

		const currentUser = ctx.get("currentUser");

		const updatedTokenArray = getUpdatedTokenArray({ currentUser, zayneRefreshToken });

		await db
			.update(users)
			.set({ refreshTokenArray: updatedTokenArray })
			.where(eq(users.id, currentUser.id));

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
