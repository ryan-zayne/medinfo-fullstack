/* eslint-disable import/no-named-as-default-member */
import type { SelectUserType } from "@medinfo/db/schema/auth";
import { pickKeys } from "@zayne-labs/toolkit-core";
import { consola } from "consola";
import { isPast } from "date-fns";
/* eslint-disable import/default */
import jwt from "jsonwebtoken";
/* eslint-enable import/default */
import { z } from "zod";
import { ENVIRONMENT } from "@/config/env";
import { getValidatedValue } from "@/lib/utils";

type JwtOptions<TExtraOptions> = TExtraOptions & {
	secretKey?: string;
};

const DecodedAuthJwtPayloadSchema = z.object({
	id: z.string(),
});

export const decodeJwtToken = <TSchema extends z.ZodType = typeof DecodedAuthJwtPayloadSchema>(
	token: string,
	options?: JwtOptions<jwt.VerifyOptions> & { schema?: TSchema }
) => {
	const {
		schema = DecodedAuthJwtPayloadSchema,
		secretKey = ENVIRONMENT.ACCESS_SECRET,
		...restOfOptions
	} = options ?? {};

	const decodedPayload = jwt.verify(token, secretKey, restOfOptions);

	const validPayload = getValidatedValue(decodedPayload as z.infer<TSchema>, schema as TSchema);

	return validPayload;
};

export const encodeJwtToken = <
	TSchema extends z.ZodType<Record<string, unknown>> = typeof DecodedAuthJwtPayloadSchema,
>(
	payload: z.infer<TSchema>,
	options?: JwtOptions<jwt.SignOptions> & { schema?: TSchema }
) => {
	const {
		schema = DecodedAuthJwtPayloadSchema,
		secretKey = ENVIRONMENT.ACCESS_SECRET,
		...restOfOptions
	} = options ?? {};

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
	compromisedRefreshToken: string;
	currentUser: SelectUserType;
}) => {
	const { compromisedRefreshToken, currentUser } = options;

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

	consola.warn(
		new Error(message, {
			cause: {
				compromisedRefreshToken,
				timestamp: new Date().toISOString(),
				user,
				userAgent: globalThis.navigator.userAgent,
			},
		})
	);

	consola.trace(message);
};

export const getUpdatedTokenResultArray = (options: {
	currentUser: SelectUserType;
	zayneRefreshToken: string | undefined;
}): SelectUserType["refreshTokenArray"] => {
	const { currentUser, zayneRefreshToken } = options;

	if (!zayneRefreshToken) {
		return currentUser.refreshTokenArray.filter((item) => !isPast(item.expiresAt));
	}

	if (!isTokenInWhitelist(currentUser.refreshTokenArray, zayneRefreshToken)) {
		warnAboutTokenReuse({ compromisedRefreshToken: zayneRefreshToken, currentUser });

		return [];
	}

	const updatedTokenResultArray = currentUser.refreshTokenArray.filter(
		(item) => item.token !== zayneRefreshToken && !isPast(item.expiresAt)
	);

	return updatedTokenResultArray;
};
