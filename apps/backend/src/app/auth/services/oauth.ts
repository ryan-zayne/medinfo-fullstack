import type { db } from "@medinfo/db";
import { users, type SelectUserType } from "@medinfo/db/schema/auth";
import { callApi } from "@zayne-labs/callapi";
import * as arctic from "arctic";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { ENVIRONMENT } from "@/config/env";
import { AppError, getValidatedValue } from "@/lib/utils";

const BASE_BACKEND_HOST =
	ENVIRONMENT.NODE_ENV === "development" ?
		ENVIRONMENT.BASE_BACKEND_HOST_DEV
	:	ENVIRONMENT.BASE_BACKEND_HOST_PROD;

export const google = new arctic.Google(
	ENVIRONMENT.GOOGLE_CLIENT_ID,
	ENVIRONMENT.GOOGLE_CLIENT_SECRET,
	`${BASE_BACKEND_HOST}/api/v1/auth/google/callback`
);

export const createGoogleAuthURL = () => {
	const state = arctic.generateState();
	const codeVerifier = arctic.generateCodeVerifier();
	const scopes = [
		"openid",
		"profile",
		"email",
		"https://www.googleapis.com/auth/user.gender.read",
		"https://www.googleapis.com/auth/user.birthday.read",
	];

	const authUrlObject = google.createAuthorizationURL(state, codeVerifier, scopes);

	const cookiesExpireAt = new Date(Date.now() + 60 * 10 * 1000);

	return { authURL: authUrlObject.toString(), codeVerifier, cookiesExpireAt, state };
};

const OAuthClaimsSchema = z.object({
	email: z.string(),
	email_verified: z.boolean(),
	family_name: z.string(),
	given_name: z.string(),
	name: z.string(),
	picture: z.string().optional(),
	sub: z.string(),
});

const OAuthUserDetailsSchema = z.object({
	dob: z.date().or(z.null()),
	email: z.string(),
	emailVerified: z.boolean(),
	firstName: z.string(),
	gender: z.literal(["male", "female"]).or(z.undefined()),
	lastName: z.string(),
	picture: z.string().or(z.undefined()),
	provider: z.literal(["google", "github"]),
	providerId: z.string(),
});

const googleDateToJSDate = (
	googleDate: { day: number; month: number; year: number } | undefined
): Date | null => {
	if (!googleDate) {
		return null;
	}

	// == Subtract 1 from the month to convert from 1-based (Google) to 0-based (JS)
	const monthIndex = googleDate.month - 1;

	return new Date(googleDate.year, monthIndex, googleDate.day);
};

export const getUserDetailsFromGoogleAuthClaims = async (code: string, codeVerifier: string) => {
	const tokens = await google.validateAuthorizationCode(code, codeVerifier).catch((error) => {
		throw new AppError({
			cause: error,
			code: 400,
			message: "Failed to validate Google authorization. Please restart the process",
		});
	});

	const claims = getValidatedValue(
		arctic.decodeIdToken(tokens.idToken()) as z.infer<typeof OAuthClaimsSchema>,
		OAuthClaimsSchema
	);

	const result = await callApi("https://people.googleapis.com/v1/people/me", {
		auth: tokens.accessToken(),
		query: {
			key: ENVIRONMENT.GOOGLE_AUTH_API_KEY,
			personFields: "genders,birthdays",
		},
		schema: {
			data: z.object({
				birthdays: z.array(
					z.object({ date: z.object({ day: z.int(), month: z.int(), year: z.int() }) })
				),
				genders: z.array(z.object({ value: z.literal(["male", "female"]) })),
			}),
		},
	});

	if (result.error) {
		throw new AppError({
			cause: result.error.originalError,
			code: 400,
			message: "Failed to fetch user info from Google",
		});
	}

	const userDetails = getValidatedValue(
		{
			dob: googleDateToJSDate(result.data.birthdays[0]?.date),
			email: claims.email,
			emailVerified: claims.email_verified,
			firstName: claims.given_name,
			gender: result.data.genders[0]?.value,
			lastName: claims.family_name,
			picture: claims.picture,
			provider: "google",
			providerId: claims.sub,
		},
		OAuthUserDetailsSchema
	);

	return userDetails;
};

const linkUserToGoogleAccount = async (
	currentUser: SelectUserType,
	userDetails: z.infer<typeof OAuthUserDetailsSchema>,
	dbClient: typeof db
) => {
	if (currentUser.googleId) return;

	const [updatedUser] = await dbClient
		.update(users)
		.set({
			...(userDetails.emailVerified && { emailVerifiedAt: currentUser.emailVerifiedAt ?? new Date() }),
			googleId: userDetails.providerId,
		})
		.where(eq(users.id, currentUser.id))
		.returning();

	return updatedUser;
};

type UserResult =
	| {
			redirectURL: string;
			user: SelectUserType;
			variant: "existing-user";
	  }
	| {
			redirectURL: string;
			user: SelectUserType;
			variant: "new-user";
	  };

const BASE_FRONTEND_HOST =
	ENVIRONMENT.NODE_ENV === "development" ?
		ENVIRONMENT.BASE_FRONTEND_HOST_DEV
	:	ENVIRONMENT.BASE_FRONTEND_HOST_PROD;

const getRedirectURL = (role: SelectUserType["role"]) => {
	return `${BASE_FRONTEND_HOST}/dashboard/${role}`;
};

export const findOrCreateUserFromGoogle = async (
	userDetails: z.infer<typeof OAuthUserDetailsSchema>,
	dbClient: typeof db
): Promise<UserResult> => {
	if (userDetails.provider !== "google") {
		throw new AppError({
			code: 400,
			message: `Invalid provider: ${userDetails.provider}`,
		});
	}

	const [existingUserWithGoogleId] = await dbClient
		.select()
		.from(users)
		.where(eq(users.googleId, userDetails.providerId))
		.limit(1);

	if (existingUserWithGoogleId) {
		return {
			redirectURL: getRedirectURL(existingUserWithGoogleId.role),
			user: existingUserWithGoogleId,
			variant: "existing-user",
		};
	}

	const [existingUserWithEmail] = await dbClient
		.select()
		.from(users)
		.where(eq(users.email, userDetails.email))
		.limit(1);

	if (existingUserWithEmail) {
		const updatedUser = await linkUserToGoogleAccount(existingUserWithEmail, userDetails, dbClient);

		return {
			redirectURL: getRedirectURL(existingUserWithEmail.role),
			user: updatedUser ?? existingUserWithEmail,
			variant: "existing-user",
		};
	}

	if (!userDetails.dob) {
		throw new AppError({
			code: 400,
			message:
				"Failed to get user's date of birth. Please ensure you set this info on your google account",
		});
	}

	if (!userDetails.gender) {
		throw new AppError({
			code: 400,
			message: "Failed to get user's gender. Please ensure you set this info on your google account",
		});
	}

	const avatar =
		userDetails.picture
		?? `https://avatar.iran.liara.run/public/${userDetails.gender === "male" ? "boy" : "girl"}`;

	const [newUser] = await dbClient
		.insert(users)
		.values({
			avatar,
			dob: userDetails.dob.toISOString(),
			email: userDetails.email,
			emailVerifiedAt: userDetails.emailVerified ? new Date() : null,
			firstName: userDetails.firstName,
			fullName: `${userDetails.firstName} ${userDetails.lastName}`,
			gender: userDetails.gender,
			googleId: userDetails.providerId,
			lastName: userDetails.lastName,
			role: "patient",
		})
		.returning();

	if (!newUser) {
		throw new AppError({
			code: 400,
			message: "Failed to create user",
		});
	}

	return {
		redirectURL: getRedirectURL(newUser.role),
		user: newUser,
		variant: "new-user",
	};
};
