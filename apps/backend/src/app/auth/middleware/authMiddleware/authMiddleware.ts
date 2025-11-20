import { getCookie, setCookie } from "@/app/auth/services/common";
import type { HonoAppBindings } from "@/lib/types/common";
import { createMiddleware } from "hono/factory";
import { validateUserSession } from "./validateUserSession";

const authMiddleware = createMiddleware<HonoAppBindings>(async (ctx, next) => {
	const zayneAccessToken = getCookie(ctx, "zayneAccessToken");
	const zayneRefreshToken = getCookie(ctx, "zayneRefreshToken");

	const { currentUser, newZayneAccessTokenResult } = await validateUserSession({
		zayneAccessToken,
		zayneRefreshToken,
	});

	if (newZayneAccessTokenResult) {
		setCookie(ctx, "zayneAccessToken", newZayneAccessTokenResult.token, {
			expires: newZayneAccessTokenResult.expiresAt,
		});
	}

	ctx.set("currentUser", currentUser);

	await next();
});

export { authMiddleware };
