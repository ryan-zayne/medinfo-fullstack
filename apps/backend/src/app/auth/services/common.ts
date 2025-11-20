/* eslint-disable import/no-named-as-default-member */
import { hash, verify } from "@node-rs/argon2";

// eslint-disable-next-line import/default
import jwt from "jsonwebtoken";

import { ENVIRONMENT } from "@/config/env";
import { isProduction } from "@/constants";
import type { SelectUserType } from "@medinfo/backend-db/schema/auth";
import { pickKeys } from "@zayne-labs/toolkit-core";
import type { UnmaskType } from "@zayne-labs/toolkit-type-helpers";
import { consola } from "consola";
import type { Context } from "hono";
import * as cookieHelpers from "hono/cookie";
import type { CookieOptions } from "hono/utils/cookie";
import { necessaryUserDetails } from "./constants";

export type JwtOptions<TExtraOptions> = TExtraOptions & {
	secretKey: string;
};

export type DecodedJwtPayload = {
	id: string;
};

export const decodeJwtToken = <TDecodedPayload extends Record<string, unknown> = DecodedJwtPayload>(
	token: string,
	options: JwtOptions<jwt.VerifyOptions>
) => {
	const { secretKey, ...restOfOptions } = options;

	const decodedPayload = jwt.verify(token, secretKey, restOfOptions) as TDecodedPayload;

	return decodedPayload;
};

export const encodeJwtToken = <TDecodedPayload extends Record<string, unknown> = DecodedJwtPayload>(
	payload: TDecodedPayload,
	options: JwtOptions<jwt.SignOptions>
) => {
	const { secretKey, ...restOfOptions } = options;

	const encodedToken = jwt.sign(payload, secretKey, restOfOptions);

	return encodedToken;
};

export const generateAccessToken = (user: SelectUserType, options?: { expiresIn?: number }) => {
	const { expiresIn = ENVIRONMENT.ACCESS_JWT_EXPIRES_IN } = options ?? {};

	const payload = pickKeys(user, ["id"]);

	const accessToken = encodeJwtToken(payload, { expiresIn, secretKey: ENVIRONMENT.ACCESS_SECRET });

	const expiresAt = new Date(Date.now() + expiresIn);

	return { expiresAt, token: accessToken };
};

export const generateRefreshToken = (user: SelectUserType, options?: { expiresIn?: number }) => {
	const { expiresIn = ENVIRONMENT.REFRESH_JWT_EXPIRES_IN } = options ?? {};

	const payload = pickKeys(user, ["id"]);

	const refreshToken = encodeJwtToken(payload, { expiresIn, secretKey: ENVIRONMENT.REFRESH_SECRET });

	const expiresAt = new Date(Date.now() + expiresIn);

	return { expiresAt, token: refreshToken };
};

export const hashValue: typeof hash = (value, options) => {
	return hash(value, {
		memoryCost: 19456,
		outputLen: 32,
		parallelism: 1,
		timeCost: 2,
		...options,
	});
};

export const verifyHashedValue: typeof verify = (...args) => verify(...args);

type PossibleCookieNames = UnmaskType<"zayneAccessToken" | "zayneRefreshToken">;

export const getCookie = (ctx: Context, name: PossibleCookieNames) => cookieHelpers.getCookie(ctx, name);

export const setCookie = (
	ctx: Context,
	name: PossibleCookieNames,
	value: string,
	options?: CookieOptions
) => {
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

export const isTokenInWhitelist = (refreshTokenArray: string[], zayneRefreshToken: string) => {
	const whiteListSet = new Set(refreshTokenArray);

	return whiteListSet.has(zayneRefreshToken);
};

export const getUpdatedTokenArray = (options: {
	currentUser: SelectUserType;
	zayneRefreshToken: string | undefined;
}): string[] => {
	const { currentUser, zayneRefreshToken } = options;

	if (!zayneRefreshToken) {
		return currentUser.refreshTokenArray;
	}

	// == If it turns out that the refreshToken is not in the whitelist array, the question is why would a user be signing in with a refreshToken that is not in the array?
	// == So it can be seen as a token reuse situation. Whether it's valid or not is of no concern rn.
	// == Is it a possible token reuse attack or not? E no concern me.
	// == Just log out the user from all devices by removing all tokens from the array to avoid any possible wahala
	if (!isTokenInWhitelist(currentUser.refreshTokenArray, zayneRefreshToken)) {
		consola.warn("Possible token reuse detected!");
		consola.trace({ timestamp: new Date().toISOString(), userId: currentUser.id });

		return [];
	}

	const updatedTokenArray = currentUser.refreshTokenArray.filter((token) => token !== zayneRefreshToken);

	return updatedTokenArray;
};

export const getNecessaryUserDetails = (user: SelectUserType, keys: Array<keyof SelectUserType> = []) => {
	return pickKeys(user, [...necessaryUserDetails, ...keys]);
};
