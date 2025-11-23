import { ENVIRONMENT } from "@/config/env";
import { AppError, getValidatedValue } from "@/lib/utils";
import { db } from "@medinfo/backend-db";
import { users, type SelectUserType } from "@medinfo/backend-db/schema/auth";
import * as arctic from "arctic";
import { eq } from "drizzle-orm";
import { z } from "zod";

const BASE_BACKEND_URL = `${ENVIRONMENT.BASE_BACKEND_HOST}api/v1`;

const BASE_FRONTEND_URL = ENVIRONMENT.BASE_BACKEND_HOST;

export const google = new arctic.Google(
	ENVIRONMENT.GOOGLE_CLIENT_ID,
	ENVIRONMENT.GOOGLE_CLIENT_SECRET,
	`${BASE_BACKEND_URL}/auth/google/callback`
);

export const createGoogleAuthURL = () => {
	const state = arctic.generateState();
	const codeVerifier = arctic.generateCodeVerifier();
	const scopes = ["openid", "profile", "email", "gender.read", "birthday.read"];

	const authUrlObject = google.createAuthorizationURL(state, codeVerifier, scopes);

	const cookiesExpireAt = new Date(Date.now() + 60 * 10 * 1000);

	return { authURL: authUrlObject.toString(), codeVerifier, cookiesExpireAt, state };
};

const OAuthClaimsSchema = z.object({
	birthdays: z.array(z.object({ day: z.int(), month: z.int(), year: z.int() }).partial()).optional(),
	email: z.string(),
	email_verified: z.boolean(),
	family_name: z.string(),
	genders: z.array(z.object({ value: z.literal(["male", "female"]) })).optional(),
	given_name: z.string(),
	locale: z.string().optional(),
	name: z.string(),
	picture: z.string().optional(),
	sub: z.string(),
});

const OAuthUserInfoSchema = z.object({
	dob: z.date().or(z.null()),
	email: z.string(),
	emailVerified: z.boolean(),
	gender: z.literal(["male", "female"]).or(z.undefined()),
	locale: z.string().or(z.undefined()),
	name: z.string(),
	picture: z.string().or(z.undefined()),
	provider: z.literal(["google", "github"]),
	providerId: z.string(),
});

const googleDateToJSDate = (googleDate?: { day?: number; month?: number; year?: number }): Date | null => {
	if (!googleDate) {
		return null;
	}

	if (!googleDate.month || !googleDate.day || !googleDate.year) {
		return null;
	}

	// Subtract 1 from the month to convert from 1-based (Google) to 0-based (JS)
	const monthIndex = googleDate.month - 1;

	return new Date(googleDate.year, monthIndex, googleDate.day);
};

export const getUserInfoFromGoogleAuthClaims = async (code: string, codeVerifier: string) => {
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

	const userInfo = getValidatedValue(
		{
			dob: googleDateToJSDate(claims.birthdays?.[0]),
			email: claims.email,
			emailVerified: claims.email_verified,
			gender: claims.genders?.[0]?.value,
			locale: claims.locale,
			name: claims.name,
			picture: claims.picture,
			provider: "google",
			providerId: claims.sub,
		},
		OAuthUserInfoSchema
	);

	return userInfo;
};

const linkUserToGoogleAccount = async (
	currentUser: SelectUserType,
	userInfo: z.infer<typeof OAuthUserInfoSchema>
) => {
	if (currentUser.googleId) return;

	const [updatedUser] = await db
		.update(users)
		.set({
			avatar: userInfo.picture ?? currentUser.avatar,
			googleId: userInfo.providerId,
		})
		.where(eq(users.id, currentUser.id))
		.returning();

	return updatedUser;
};

type UserResult =
	| {
			redirectURL: string;
			user: SelectUserType;
			variant: "existingUser";
	  }
	| {
			redirectURL: string;
			user: SelectUserType;
			variant: "newUser";
	  };

export const findOrCreateUserFromGoogle = async (
	userInfo: z.infer<typeof OAuthUserInfoSchema>
): Promise<UserResult> => {
	if (userInfo.provider !== "google") {
		throw new AppError({
			code: 400,
			message: `Invalid provider: ${userInfo.provider}`,
		});
	}

	const [existingUserWithGoogleId] = await db
		.select()
		.from(users)
		.where(eq(users.googleId, userInfo.providerId))
		.limit(1);

	if (existingUserWithGoogleId) {
		return {
			redirectURL: BASE_FRONTEND_URL,
			user: existingUserWithGoogleId,
			variant: "existingUser",
		};
	}

	const [existingUserWithEmail] = await db
		.select()
		.from(users)
		.where(eq(users.email, userInfo.email))
		.limit(1);

	if (existingUserWithEmail) {
		const updatedUser = await linkUserToGoogleAccount(existingUserWithEmail, userInfo);

		return {
			redirectURL: BASE_FRONTEND_URL,
			user: updatedUser ?? existingUserWithEmail,
			variant: "existingUser",
		};
	}

	if (!userInfo.dob) {
		throw new AppError({
			code: 400,
			message:
				"Failed to get user's date of birth. Please ensure you set this info on your google account",
		});
	}

	if (!userInfo.gender) {
		throw new AppError({
			code: 400,
			message: "Failed to get user's gender. Please ensure you set this info on your google account",
		});
	}

	const avatar =
		userInfo.picture
		?? `https://avatar.iran.liara.run/public/${userInfo.gender === "male" ? "boy" : "girl"}`;

	const [newUser] = await db
		.insert(users)
		.values({
			avatar,
			country: userInfo.locale?.split("-")[1] as string,
			dob: userInfo.dob.toISOString(),
			email: userInfo.email,
			emailVerifiedAt: userInfo.emailVerified ? new Date() : null,
			firstName: userInfo.name.split(" ")[0] as string,
			gender: userInfo.gender,
			googleId: userInfo.providerId,
			lastName: userInfo.name.split(" ")[1] as string,
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
		redirectURL: BASE_FRONTEND_URL,
		user: newUser,
		variant: "newUser",
	};
};
