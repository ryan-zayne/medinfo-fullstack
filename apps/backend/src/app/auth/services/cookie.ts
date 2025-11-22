import { ENVIRONMENT } from "@/config/env";
import type { UnmaskType } from "@zayne-labs/toolkit-type-helpers";
import type { Context } from "hono";
import * as cookieHelpers from "hono/cookie";
import type { CookieOptions } from "hono/utils/cookie";

type PossibleCookieNames = UnmaskType<
	"zayneAccessToken" | "zayneRefreshToken" | "google_oauth_state" | "google_code_verifier"
>;

export const getCookie = (ctx: Context, name: PossibleCookieNames) => cookieHelpers.getCookie(ctx, name);

export const setCookie = (
	ctx: Context,
	name: PossibleCookieNames,
	value: string,
	options?: CookieOptions
) => {
	const isProduction = ENVIRONMENT.NODE_ENV === "production";

	cookieHelpers.setCookie(ctx, name, value, {
		httpOnly: true,
		partitioned: isProduction,
		sameSite: isProduction ? "none" : "lax",
		secure: isProduction,
		...options,
	});
};

export const removeCookie = (ctx: Context, name: PossibleCookieNames) => {
	cookieHelpers.deleteCookie(ctx, name);
};
