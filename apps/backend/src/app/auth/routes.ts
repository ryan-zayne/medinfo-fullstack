import { db } from "@medinfo/db";
import { emailVerificationCodes, passwordResetTokens, users } from "@medinfo/db/schema/auth";
import { backendApiSchemaRoutes, SignUpSchema } from "@medinfo/shared/validation/backendApiSchema";
import { pickKeys } from "@zayne-labs/toolkit-core";
import { differenceInHours, isPast } from "date-fns";
import { eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { z } from "zod";
import { authRateLimiterOptions } from "@/config/rateLimiterOptions";
import { AppError, AppJsonResponse, getValidatedValue } from "@/lib/utils";
import { authMiddleware, validateWithZodMiddleware } from "@/middleware";
import { AUTH_ERROR_MESSAGES } from "@/middleware/authMiddleware/constants";
import { removeFromCache, setCache } from "@/services/cache";
import { uploadStreamToCloudinary } from "@/services/cloudinary";
import { getNecessaryUserDetails } from "./services/common";
import { deleteCookie, getCookie, setCookie } from "./services/cookie";
import {
	sendPasswordResetCompleteEmail,
	sendPasswordResetEmail,
	sendVerificationEmail,
} from "./services/emails";
import { hashValue, verifyHashedValue } from "./services/hash";
import {
	createGoogleAuthURL,
	findOrCreateUserFromGoogle,
	getUserDetailsFromGoogleAuthClaims,
} from "./services/oauth";
import {
	decodeJwtToken,
	generateAccessToken,
	generateRefreshToken,
	getUpdatedTokenResultArray,
} from "./services/token";

const authRoutes = new Hono()
	.basePath("/auth")
	.use(rateLimiter(authRateLimiterOptions))
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

		const [existingUser] = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (existingUser) {
			throw new AppError({
				code: 400,
				message: "User already exists",
			});
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
				throw new AppError({
					code: 500,
					message: "Failed to create user",
				});
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

			// Send verification email within transaction to ensure atomicity
			await sendVerificationEmail(updatedUser, tx as unknown as typeof db);

			return { newUser: updatedUser, newZayneRefreshTokenResult };
		});

		// Cache user data after successful transaction
		await setCache(`user:${result.newUser.id}`, result.newUser);

		return AppJsonResponse(ctx, {
			data: {
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
					cause: "No user with this email found",
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

			if (currentUser.suspendedAt) {
				throw new AppError({
					code: 401,
					message: AUTH_ERROR_MESSAGES.ACCOUNT_SUSPENDED,
				});
			}

			if (!currentUser.emailVerifiedAt) {
				await sendVerificationEmail(currentUser, db);

				throw new AppError({
					code: 401,
					message: AUTH_ERROR_MESSAGES.EMAIL_UNVERIFIED,
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

			const newZayneRefreshTokenResult = generateRefreshToken(currentUser);

			const [updatedUser] = await db
				.update(users)
				.set({
					lastLoginAt: new Date(),
					loginRetryCount: 0,
					refreshTokenArray: [
						...getUpdatedTokenResultArray({
							currentUser,
							zayneRefreshToken: getCookie(ctx, "zayneRefreshToken"),
						}),
						newZayneRefreshTokenResult,
					],
				})
				.where(eq(users.id, currentUser.id))
				.returning();

			if (!updatedUser) {
				throw new AppError({
					code: 500,
					message: "User update failed",
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
	.get("/signout/all", authMiddleware, async (ctx) => {
		const currentUser = ctx.get("currentUser");

		await Promise.all([
			db.update(users).set({ refreshTokenArray: [] }).where(eq(users.id, currentUser.id)),
			removeFromCache(`user:${currentUser.id}`),
		]);

		deleteCookie(ctx, "zayneAccessToken");
		deleteCookie(ctx, "zayneRefreshToken");

		return AppJsonResponse(ctx, {
			data: null,
			message: "Signed out from all devices successfully",
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
	})
	.post(
		"/verify-email",
		validateWithZodMiddleware("json", backendApiSchemaRoutes["@post/auth/verify-email"].body),
		async (ctx) => {
			const { code, email } = ctx.req.valid("json");

			const [result] = await db
				.select({
					code: emailVerificationCodes.code,
					expiresAt: emailVerificationCodes.expiresAt,
					userId: users.id,
				})
				.from(emailVerificationCodes)
				.innerJoin(users, eq(emailVerificationCodes.userId, users.id))
				.where(eq(users.email, email))
				.limit(1);

			if (!result) {
				throw new AppError({
					cause: "No user or verification code found",
					code: 400,
					message: "Invalid or expired verification code",
				});
			}

			if (isPast(result.expiresAt)) {
				await db
					.delete(emailVerificationCodes)
					.where(eq(emailVerificationCodes.userId, result.userId));

				throw new AppError({
					cause: "Verification code has expired",
					code: 400,
					message: "Invalid or expired verification code",
				});
			}

			const isCodeValid = await verifyHashedValue(result.code, code);

			if (!isCodeValid) {
				throw new AppError({
					cause: "Invalid verification code",
					code: 400,
					message: "Invalid or expired verification code",
				});
			}

			const [updatedUser] = await db
				.update(users)
				.set({ emailVerifiedAt: new Date() })
				.where(eq(users.email, email))
				.returning({ email: users.email, role: users.role });

			if (!updatedUser) {
				throw new AppError({
					code: 500,
					message: "User update failed",
				});
			}

			await db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.userId, result.userId));

			return AppJsonResponse(ctx, {
				data: {
					user: updatedUser,
				},
				message: "Account successfully verified!",
				schema: backendApiSchemaRoutes["@post/auth/verify-email"].data,
			});
		}
	)
	.post(
		"/resend-verification-email",
		validateWithZodMiddleware(
			"json",
			backendApiSchemaRoutes["@post/auth/resend-verification-email"].body
		),
		async (ctx) => {
			const { email } = ctx.req.valid("json");

			const [existingUser] = await db
				.select(pickKeys(users, ["id", "emailVerifiedAt", "email", "firstName"]))
				.from(users)
				.where(eq(users.email, email))
				.limit(1);

			if (!existingUser) {
				throw new AppError({
					code: 404,
					message: "No account found with this email address",
				});
			}

			if (existingUser.emailVerifiedAt) {
				throw new AppError({
					code: 400,
					message: "Email is already verified",
				});
			}

			await sendVerificationEmail(existingUser, db);

			return AppJsonResponse(ctx, {
				data: null,
				message: "Verification email sent successfully",
				schema: backendApiSchemaRoutes["@post/auth/resend-verification-email"].data,
			});
		}
	)
	.post(
		"/forgot-password",
		validateWithZodMiddleware("json", backendApiSchemaRoutes["@post/auth/forgot-password"].body),
		async (ctx) => {
			const { email } = ctx.req.valid("json");

			const [existingUser] = await db
				.select({
					email: users.email,
					firstName: users.firstName,
					id: users.id,
					passwordResetRetryCount: users.passwordResetRetryCount,
				})
				.from(users)
				.where(eq(users.email, email))
				.limit(1);

			if (!existingUser) {
				throw new AppError({
					code: 404,
					message: "No user found with provided email",
				});
			}

			if (existingUser.passwordResetRetryCount >= 3) {
				await db
					.update(users)
					.set({
						suspendedAt: new Date(),
					})
					.where(eq(users.id, existingUser.id));

				throw new AppError({
					code: 401,
					message: "Password reset retries exceeded! Account suspended temporarily",
				});
			}

			await db.transaction(async (tx) => {
				await tx
					.update(users)
					.set({
						passwordResetRetryCount: sql`${users.passwordResetRetryCount} + 1`,
					})
					.where(eq(users.id, existingUser.id));

				await sendPasswordResetEmail(existingUser, tx as unknown as typeof db);
			});

			return AppJsonResponse(ctx, {
				data: null,
				message: `Password reset link sent to ${email}`,
				schema: backendApiSchemaRoutes["@post/auth/forgot-password"].data,
			});
		}
	)
	.post(
		"/reset-password",
		validateWithZodMiddleware("json", backendApiSchemaRoutes["@post/auth/reset-password"].body),
		async (ctx) => {
			const { newPassword, token } = ctx.req.valid("json");

			const [result] = await db
				.select({
					tokenExpiresAt: passwordResetTokens.expiresAt,
					tokenId: passwordResetTokens.id,
					tokenValue: passwordResetTokens.token,
					userId: users.id,
				})
				.from(passwordResetTokens)
				.innerJoin(users, eq(passwordResetTokens.userId, users.id))
				.where(eq(passwordResetTokens.token, token))
				.limit(1);

			if (!result) {
				throw new AppError({
					cause: "No user or reset token found",
					code: 400,
					message: "Invalid or expired reset token",
				});
			}

			if (isPast(result.tokenExpiresAt)) {
				await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, result.userId));

				throw new AppError({
					cause: "Reset token has expired",
					code: 400,
					message: "Invalid or expired reset token",
				});
			}

			const decodedPayload = decodeJwtToken(token, {
				schema: z.object({ token: z.string() }),
			});

			if (!decodedPayload.token) {
				throw new AppError({
					cause: "Invalid reset token payload",
					code: 400,
					message: "Invalid or expired reset token",
				});
			}

			const newPasswordHash = await hashValue(newPassword);

			const { updatedUser } = await db.transaction(async (tx) => {
				const [updatedResult] = await tx
					.update(users)
					.set({
						passwordChangedAt: new Date(),
						passwordHash: newPasswordHash,
						passwordResetRetryCount: 0,
						// Sign out from all devices
						refreshTokenArray: [],
						suspendedAt: null,
					})
					.where(eq(users.id, result.userId))
					.returning();

				await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.id, result.tokenId));

				return { updatedUser: updatedResult };
			});

			if (!updatedUser) {
				throw new AppError({
					code: 400,
					message: "Password reset failed",
				});
			}

			await Promise.all([
				removeFromCache(`user:${updatedUser.id}`),
				sendPasswordResetCompleteEmail({ email: updatedUser.email, firstName: updatedUser.firstName }),
			]);

			return AppJsonResponse(ctx, {
				data: null,
				message: "Password reset successfully. Please sign in with your new password.",
				schema: backendApiSchemaRoutes["@post/auth/reset-password"].data,
			});
		}
	)
	.patch(
		"/update-profile",
		authMiddleware,
		validateWithZodMiddleware("json", backendApiSchemaRoutes["@patch/auth/update-profile"].body),
		async (ctx) => {
			const { bio, city, country, firstName, gender, lastName } = ctx.req.valid("json");

			const currentUser = ctx.get("currentUser");

			const fullName =
				firstName || lastName ?
					`${firstName ?? currentUser.firstName} ${lastName ?? currentUser.lastName}`
				:	undefined;

			const [updatedUser] = await db
				.update(users)
				.set({
					...(bio && { bio }),
					...(city && { city }),
					...(country && { country }),
					...(firstName && { firstName }),
					...(fullName && { fullName }),
					...(gender && { gender }),
					...(lastName && { lastName }),
				})
				.where(eq(users.id, currentUser.id))
				.returning();

			if (!updatedUser) {
				throw new AppError({
					code: 500,
					message: "Failed to update profile",
				});
			}

			await setCache(`user:${updatedUser.id}`, updatedUser);

			return AppJsonResponse(ctx, {
				data: { user: getNecessaryUserDetails(updatedUser) },
				message: "Profile updated successfully",
				schema: backendApiSchemaRoutes["@patch/auth/update-profile"].data,
			});
		}
	)
	.patch(
		"/change-password",
		authMiddleware,
		validateWithZodMiddleware("json", backendApiSchemaRoutes["@patch/auth/change-password"].body),
		async (ctx) => {
			const { currentPassword, newPassword } = ctx.req.valid("json");

			const currentUser = ctx.get("currentUser");

			if (!currentUser.passwordHash) {
				throw new AppError({
					code: 400,
					message: "This account uses Google sign-in and has no password to change.",
				});
			}

			const isValidPassword = await verifyHashedValue(currentUser.passwordHash, currentPassword);

			if (!isValidPassword) {
				throw new AppError({
					code: 401,
					message: "Current password is incorrect",
				});
			}

			const zayneRefreshToken = getCookie(ctx, "zayneRefreshToken");

			const newPasswordHash = await hashValue(newPassword);

			const [updatedUser] = await db
				.update(users)
				.set({
					passwordChangedAt: new Date(),
					passwordHash: newPasswordHash,
					// Sign out from other devices aside from current one
					refreshTokenArray: currentUser.refreshTokenArray.filter(
						(item) => item.token === zayneRefreshToken
					),
				})
				.where(eq(users.id, currentUser.id))
				.returning();

			if (!updatedUser) {
				throw new AppError({
					code: 500,
					message: "Password change failed",
				});
			}

			await setCache(`user:${updatedUser.id}`, updatedUser);

			return AppJsonResponse(ctx, {
				data: null,
				message: "Password changed successfully",
				schema: backendApiSchemaRoutes["@patch/auth/change-password"].data,
			});
		}
	);

export { authRoutes };
