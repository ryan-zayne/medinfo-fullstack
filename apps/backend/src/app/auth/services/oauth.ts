import { ENVIRONMENT } from "@/config/env";
import { AppError } from "@/lib/utils";
import * as arctic from "arctic";

export const google = new arctic.Google(
	ENVIRONMENT.GOOGLE_CLIENT_ID,
	ENVIRONMENT.GOOGLE_CLIENT_SECRET,
	ENVIRONMENT.GOOGLE_REDIRECT_URI_DEV
);

export const createGoogleAuthorizationURL = () => {
	const state = arctic.generateState();
	const codeVerifier = arctic.generateCodeVerifier();
	const scopes = ["openid", "profile", "email"];

	const urlObject = google.createAuthorizationURL(state, codeVerifier, scopes);

	// Set access_type to offline to get refresh tokens (only on first auth)
	urlObject.searchParams.set("access_type", "offline");

	return { codeVerifier, state, urlObject };
};

export const validateGoogleAuthorizationCode = async (code: string, codeVerifier: string) => {
	try {
		const tokens = await google.validateAuthorizationCode(code, codeVerifier);

		return {
			accessToken: tokens.accessToken(),
			accessTokenExpiresAt: tokens.accessTokenExpiresAt(),
			refreshToken: tokens.hasRefreshToken() ? tokens.refreshToken() : null,
		};
	} catch (error) {
		if (error instanceof arctic.OAuth2RequestError) {
			throw new AppError({
				cause: error,
				code: 400,
				message: "Invalid authorization code or credentials",
			});
		}

		if (error instanceof arctic.ArcticFetchError) {
			throw new AppError({
				cause: error.cause,
				code: 500,
				message: "Failed to validate authorization code",
			});
		}

		throw new AppError({
			cause: error,
			code: 500,
			message: "OAuth validation failed",
		});
	}
};

export const getGoogleUser = async (accessToken: string) => {
	const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.ok) {
		throw new AppError({
			code: 500,
			message: "Failed to fetch user from Google",
		});
	}

	const user = (await response.json()) as {
		email: string;
		email_verified: boolean;
		family_name: string;
		given_name: string;
		name: string;
		picture: string;
		sub: string; // Google user ID
	};

	return user;
};
