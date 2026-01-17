/* eslint-disable import/no-named-as-default-member */
import { SelectUserSchema, type SelectUserType } from "@medinfo/db/schema/auth";
import { pickKeys } from "@zayne-labs/toolkit-core";
import { consola } from "consola";
// eslint-disable-next-line import/default
import jwt from "jsonwebtoken";
import { z } from "zod";
import { ENVIRONMENT } from "@/config/env";
import { getValidatedValue } from "@/lib/utils";

type JwtOptions<TExtraOptions> = TExtraOptions & {
	secretKey: string;
};

const DecodedAuthJwtPayloadSchema = SelectUserSchema.pick({ id: true });

export const decodeJwtToken = <TSchema extends z.ZodType = typeof DecodedAuthJwtPayloadSchema>(
	token: string,
	options: JwtOptions<jwt.VerifyOptions> & { schema?: TSchema }
) => {
	const { schema = DecodedAuthJwtPayloadSchema, secretKey, ...restOfOptions } = options;

	const decodedPayload = jwt.verify(token, secretKey, restOfOptions);

	const validPayload = getValidatedValue(decodedPayload as z.infer<typeof schema>, schema);

	return validPayload;
};

export const encodeJwtToken = <
	TSchema extends z.ZodType<Record<string, unknown>> = typeof DecodedAuthJwtPayloadSchema,
>(
	payload: z.infer<TSchema>,
	options: JwtOptions<jwt.SignOptions> & { schema?: TSchema }
) => {
	const { schema = DecodedAuthJwtPayloadSchema, secretKey, ...restOfOptions } = options;

	const validPayload = getValidatedValue(payload, schema);

	const encodedToken = jwt.sign(validPayload, secretKey, restOfOptions);

	return encodedToken;
};

export const generateAccessToken = (
	user: SelectUserType,
	options?: { expiresIn?: number }
): SelectUserType["refreshTokenArray"][number] => {
	const { expiresIn = ENVIRONMENT.ACCESS_JWT_EXPIRES_IN } = options ?? {};

	const payload = pickKeys(user, ["id"]);

	const accessToken = encodeJwtToken(payload, { expiresIn, secretKey: ENVIRONMENT.ACCESS_SECRET });

	const expiresAt = new Date(Date.now() + expiresIn);

	return { expiresAt, token: accessToken };
};

export const generateRefreshToken = (
	user: SelectUserType,
	options?: { expiresIn?: number }
): SelectUserType["refreshTokenArray"][number] => {
	const { expiresIn = ENVIRONMENT.REFRESH_JWT_EXPIRES_IN } = options ?? {};

	const payload = pickKeys(user, ["id"]);

	const refreshToken = encodeJwtToken(payload, { expiresIn, secretKey: ENVIRONMENT.REFRESH_SECRET });

	const expiresAt = new Date(Date.now() + expiresIn);

	return { expiresAt, token: refreshToken };
};

export const isTokenInWhitelist = (
	refreshTokenArray: SelectUserType["refreshTokenArray"],
	zayneRefreshToken: string
) => {
	const whiteListSet = new Set(refreshTokenArray.map((item) => item.token));

	return whiteListSet.has(zayneRefreshToken);
};

export const warnAboutTokenReuse = (options: {
	compromisedToken: string;
	currentUser: SelectUserType;
}) => {
	const { compromisedToken, currentUser } = options;

	const message = "Possible token reuse detected!";

	const user = pickKeys(currentUser, [
		"id",
		"email",
		"firstName",
		"lastName",
		"role",
		"lastLoginAt",
		"loginRetryCount",
	]);

	consola.warn(message);
	consola.warn({
		compromisedToken,
		timestamp: new Date().toISOString(),
		user,
		userAgent: navigator.userAgent,
	});
	console.trace();
};

export const getUpdatedTokenResultArray = (options: {
	currentUser: SelectUserType;
	zayneRefreshToken: string | undefined;
}): SelectUserType["refreshTokenArray"] => {
	const { currentUser, zayneRefreshToken } = options;

	if (!zayneRefreshToken) {
		return currentUser.refreshTokenArray;
	}

	// == If it turns out that the refreshToken is not in the whitelist array, the question is why would a user be signing in with a refreshToken that is not in the array?
	// == So it can be seen as a token reuse situation. Whether it's valid or not is of no concern rn.
	// == Is it a possible token reuse attack or not? E no concern me.
	// == Just log out the user from all other devices by removing all tokens from the array to avoid any possible issues

	if (!isTokenInWhitelist(currentUser.refreshTokenArray, zayneRefreshToken)) {
		warnAboutTokenReuse({ compromisedToken: zayneRefreshToken, currentUser });

		return [];
	}

	const updatedTokenResultArray = currentUser.refreshTokenArray.filter(
		(item) => item.token !== zayneRefreshToken
	);

	return updatedTokenResultArray;
};
