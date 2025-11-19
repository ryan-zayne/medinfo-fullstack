import { AppError, AppJsonResponse } from "@/lib/utils";
import { validateWithZod } from "@/middlewares";
import { protect } from "@/middlewares/protect/protect";
import { db } from "@medinfo/backend-db";
import { users } from "@medinfo/backend-db/schema/auth";
import { backendApiSchemaRoutes } from "@medinfo/shared/validation/backendApiSchema";
import { differenceInHours } from "date-fns";
import { eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import {
	generateAccessToken,
	generateRefreshToken,
	getCookie,
	getNecessaryUserDetails,
	getUpdatedTokenArray,
	hashValue,
	removeCookie,
	setCookie,
	verifyHashedValue,
} from "./services/common";

const authRoutes = new Hono()
	.basePath("/auth")
	.post(
		"/signup",
		validateWithZod("json", backendApiSchemaRoutes["@post/auth/signup"].body),
		async (ctx) => {
			const {
				country,
				dob,
				email,
				firstName,
				gender,
				lastName,
				medicalCertificate,
				password,
				role,
				specialty,
			} = ctx.req.valid("json");

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
					gender,
					lastName,
					medicalCertificate,
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
				.set({ refreshTokenArray: [newZayneRefreshTokenResult.token] })
				.where(eq(users.id, newUser.id));

			const newZayneAccessTokenResult = generateAccessToken(newUser);

			setCookie(ctx, "zayneAccessToken", newZayneAccessTokenResult.token, {
				expires: newZayneAccessTokenResult.expiresAt,
			});

			setCookie(ctx, "zayneRefreshToken", newZayneRefreshTokenResult.token, {
				expires: newZayneRefreshTokenResult.expiresAt,
			});

			// TODO: Send Verification email

			return AppJsonResponse(ctx, {
				data: { user: getNecessaryUserDetails(newUser) },
				message: "Account created successfully",
				routeSchemaKey: "@post/auth/signup",
			});
		}
	)
	.post(
		"/signin",
		validateWithZod("json", backendApiSchemaRoutes["@post/auth/signin"].body),
		async (ctx) => {
			const { email, password } = ctx.req.valid("json");

			const [currentUser] = await db.select().from(users).where(eq(users.email, email));

			if (!currentUser) {
				throw new AppError({
					code: 401,
					message: "Email or password is incorrect",
				});
			}

			const isValidPassword = await verifyHashedValue(currentUser.passwordHash, password);

			if (!isValidPassword) {
				// == For every time the password is gotten wrong, increment the login retry count by 1
				await db.update(users).set({ loginRetryCount: sql`${users.loginRetryCount} + 1` });

				throw new AppError({
					code: 401,
					message: "Email or password is incorrect",
				});
			}

			if (!currentUser.emailVerifiedAt) {
				// TODO send verification email
			}

			if (currentUser.isSuspended) {
				throw new AppError({
					code: 401,
					message: "Your account is currently suspended",
				});
			}

			const now = new Date();

			const hoursSinceLastLogin = differenceInHours(now, currentUser.lastLoginAt);

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
					// == Update user loginRetries to 0 and lastLoginAt to current time
					lastLoginAt: new Date(),
					loginRetryCount: 0,
					refreshTokenArray: [...updatedTokenArray, newZayneRefreshTokenResult.token],
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

			setCookie(ctx, "zayneAccessToken", newZayneAccessTokenResult.token, {
				expires: newZayneAccessTokenResult.expiresAt,
			});

			setCookie(ctx, "zayneRefreshToken", newZayneRefreshTokenResult.token, {
				expires: newZayneRefreshTokenResult.expiresAt,
			});

			return AppJsonResponse(ctx, {
				data: { user: getNecessaryUserDetails(updatedUser) },
				message: "Signed in successfully",
				routeSchemaKey: "@post/auth/signin",
			});
		}
	)
	.get("/signout", protect, async (ctx) => {
		const currentUser = ctx.get("currentUser");

		const zayneRefreshToken = getCookie(ctx, "zayneRefreshToken");

		const updatedTokenArray = getUpdatedTokenArray({ currentUser, zayneRefreshToken });

		await db
			.update(users)
			.set({ refreshTokenArray: updatedTokenArray })
			.where(eq(users.id, currentUser.id));

		removeCookie(ctx, "zayneAccessToken");
		removeCookie(ctx, "zayneRefreshToken");

		return AppJsonResponse(ctx, {
			data: null,
			message: "Signed out successfully",
			routeSchemaKey: "@get/auth/signout",
		});
	})
	.get("/session", protect, async (ctx) => {
		const currentUser = ctx.get("currentUser");

		return AppJsonResponse(ctx, {
			data: { user: getNecessaryUserDetails(currentUser) },
			message: "Session fetched successfully",
			routeSchemaKey: "@get/auth/session",
		});
	});

export { authRoutes };
