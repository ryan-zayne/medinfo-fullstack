/* eslint-disable import/no-named-as-default-member */
import {
	decodeJwtToken,
	generateAccessToken,
	generateRefreshToken,
	isTokenInWhitelist,
	type DecodedJwtPayload,
} from "@/app/auth/services/common";
import { ENVIRONMENT } from "@/config/env";
import { AppError } from "@/lib/utils";
import { db } from "@medinfo/backend-db";
import { users, type SelectUserType } from "@medinfo/backend-db/schema/auth";
import { defineEnum } from "@zayne-labs/toolkit-type-helpers";
import { consola } from "consola";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const AUTH_ERROR_MESSAGES = defineEnum({
	ACCOUNT_SUSPENDED: "Your account is currently suspended",
	GENERIC_ERROR: "An error occurred, please log in again",
	INVALID_SESSION: "Invalid session. Please log in again!",
	SESSION_EXPIRED: "Session expired, please log in again",
	UNAUTHORIZED: "Unauthorized",
	USER_NOT_FOUND: "User not found or not logged in",
});

const getUserFromToken = async (decodedPayload: DecodedJwtPayload, zayneRefreshToken: string) => {
	const [currentUser] = await db.select().from(users).where(eq(users.id, decodedPayload.id)).limit(1);

	if (!currentUser) {
		throw new AppError({
			code: 404,
			message: AUTH_ERROR_MESSAGES.USER_NOT_FOUND,
		});
	}

	// == At this point, the refresh token is still valid but is not in the refreshTokenArray (whitelist)
	// == So it can be seen as a token reuse situation
	// == So clear the refreshTokenArray to log out the user from all devices, greatly diminishing the risk of another token reuse attack

	if (!isTokenInWhitelist(currentUser.refreshTokenArray, zayneRefreshToken)) {
		consola.warn("Possible token reuse detected!");
		consola.trace({ timestamp: new Date().toISOString(), userId: currentUser.id });

		await db.update(users).set({ refreshTokenArray: [] }).where(eq(users.id, decodedPayload.id));

		throw new AppError({
			code: 401,
			message: AUTH_ERROR_MESSAGES.INVALID_SESSION,
		});
	}

	if (currentUser.isSuspended) {
		throw new AppError({
			code: 401,
			message: AUTH_ERROR_MESSAGES.ACCOUNT_SUSPENDED,
		});
	}

	// TODO csrf protection
	// TODO browser client fingerprinting

	return currentUser;
};

type ValidSession =
	| {
			currentUser: SelectUserType;
			newZayneAccessTokenResult: null;
			newZayneRefreshTokenResult: null;
	  }
	| {
			currentUser: SelectUserType;
			newZayneAccessTokenResult: ReturnType<typeof generateAccessToken>;
			newZayneRefreshTokenResult: ReturnType<typeof generateRefreshToken>;
	  };

/**
 * @description This function is used to validate the refresh token and generate a new access and refresh token
 * @returns The current user, the new access token and refresh token
 * @throws { AppError } with status code `401` if the refresh token is invalid
 */
const renewUserSession = async (zayneRefreshToken: string): Promise<ValidSession> => {
	try {
		const decodedRefreshPayload = decodeJwtToken(zayneRefreshToken, {
			secretKey: ENVIRONMENT.REFRESH_SECRET,
		});

		const currentUser = await getUserFromToken(decodedRefreshPayload, zayneRefreshToken);

		const newZayneAccessTokenResult = generateAccessToken(currentUser);

		const newZayneRefreshTokenResult = generateRefreshToken(currentUser);

		return {
			currentUser,
			newZayneAccessTokenResult,
			newZayneRefreshTokenResult,
		};
	} catch (error) {
		if (error instanceof AppError) {
			throw error;
		}

		// == If the refresh token is invalid, throw an error
		if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
			throw new AppError({
				cause: error,
				code: 401,
				message: AUTH_ERROR_MESSAGES.SESSION_EXPIRED,
			});
		}

		throw new AppError({
			cause: error,
			code: 401,
			message: AUTH_ERROR_MESSAGES.GENERIC_ERROR,
		});
	}
};

type TokenPairFromCookies = {
	zayneAccessToken: string | undefined;
	zayneRefreshToken: string | undefined;
};

/**
 * @description Main authentication function that validates or refreshes user sessions
 * Handles both initial authentication and token refresh scenarios
 */
const validateUserSession = async (tokens: TokenPairFromCookies): Promise<ValidSession> => {
	const { zayneAccessToken, zayneRefreshToken } = tokens;

	if (!zayneRefreshToken) {
		throw new AppError({
			code: 401,
			message: AUTH_ERROR_MESSAGES.UNAUTHORIZED,
		});
	}

	// == If access token is not present, verify the refresh token and generate new tokens
	if (!zayneAccessToken) {
		return renewUserSession(zayneRefreshToken);
	}

	try {
		// == Validate existing session
		const decodedAccessPayload = decodeJwtToken(zayneAccessToken, {
			secretKey: ENVIRONMENT.ACCESS_SECRET,
		});

		const currentUser = await getUserFromToken(decodedAccessPayload, zayneRefreshToken);

		return {
			currentUser,
			newZayneAccessTokenResult: null,
			newZayneRefreshTokenResult: null,
		};

		// Handle errors
	} catch (error) {
		// == Attempt session renewal if the error indicates that the access token is invalid / expired
		if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
			return renewUserSession(zayneRefreshToken);
		}

		// == Else rethrow the error
		if (error instanceof AppError) {
			throw error;
		}

		throw new AppError({
			cause: error,
			code: 401,
			message: AUTH_ERROR_MESSAGES.GENERIC_ERROR,
		});
	}
};

export { validateUserSession };
