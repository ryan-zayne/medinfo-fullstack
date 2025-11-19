import { getCookie, getUpdatedTokenArray, setCookie } from "@/app/auth/services/common";
import type { HonoAppBindings } from "@/lib/types/common";
import { AppError } from "@/lib/utils";
import { db } from "@medinfo/backend-db";
import { users } from "@medinfo/backend-db/schema/auth";
import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import { validateUserSession } from "./validateUserSession";

const protect = createMiddleware<HonoAppBindings>(async (ctx, next) => {
	const zayneAccessToken = getCookie(ctx, "zayneAccessToken");
	const zayneRefreshToken = getCookie(ctx, "zayneRefreshToken");

	const { currentUser, newZayneAccessTokenResult, newZayneRefreshTokenResult } =
		await validateUserSession({
			zayneAccessToken,
			zayneRefreshToken,
		});

	//  == Attach the user to the request object and return if no new tokens are generated
	if (!newZayneAccessTokenResult) {
		ctx.set("currentUser", currentUser);

		await next();

		return;
	}

	setCookie(ctx, "zayneAccessToken", newZayneAccessTokenResult.token, {
		expires: newZayneAccessTokenResult.expiresAt,
	});

	setCookie(ctx, "zayneRefreshToken", newZayneRefreshTokenResult.token, {
		expires: newZayneRefreshTokenResult.expiresAt,
	});

	const updatedTokenArray = getUpdatedTokenArray({ currentUser, zayneRefreshToken });

	const [updatedUser] = await db
		.update(users)
		.set({ refreshTokenArray: [...updatedTokenArray, newZayneRefreshTokenResult.token] })
		.where(eq(users.id, currentUser.id))
		.returning();

	if (!updatedUser) {
		throw new AppError({
			code: 401,
			message: "Failed to grant access",
		});
	}

	// == Attach the updated user to context
	ctx.set("currentUser", updatedUser);

	await next();
});

export { protect };
