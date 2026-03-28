import type { db } from "@medinfo/db";
import { emailVerificationCodes, passwordResetTokens, type SelectUserType } from "@medinfo/db/schema/auth";
import { add } from "date-fns";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { generateRandom6DigitCode, generateRandomBytes } from "@/lib/utils/random";
import { addEmailToQueue } from "@/services/queues";
import { hashValue } from "./hash";
import { encodeJwtToken } from "./token";

export const sendVerificationEmail = async (
	user: Pick<SelectUserType, "email" | "firstName" | "id">,
	dbClient: typeof db
) => {
	const rawCode = generateRandom6DigitCode();

	const hashedCode = await hashValue(rawCode);

	const codeExpiry = add(new Date(), { minutes: 15 });

	// Invalidate any existing codes for this user before creating a new one
	// await dbClient.delete(emailVerificationCodes).where(eq(emailVerificationCodes.userId, user.id));

	await dbClient
		.insert(emailVerificationCodes)
		.values({
			code: hashedCode,
			email: user.email,
			expiresAt: codeExpiry,
			userId: user.id,
		})
		.onConflictDoUpdate({
			set: {
				code: hashedCode,
				email: user.email,
				expiresAt: codeExpiry,
			},
			target: emailVerificationCodes.userId,
		});

	await addEmailToQueue({
		data: {
			email: user.email,
			name: user.firstName,
			to: user.email,
			validationCode: rawCode,
		},
		onError: async () => {
			await dbClient.delete(emailVerificationCodes).where(eq(emailVerificationCodes.userId, user.id));
		},
		type: "verifyEmail",
	});
};

export const sendPasswordResetEmail = async (
	user: Pick<SelectUserType, "email" | "firstName" | "id">,
	dbClient: typeof db
) => {
	const rawToken = generateRandomBytes();

	const tokenExpiry = add(new Date(), { minutes: 20 });

	// Invalidate any existing tokens for this user before creating a new one
	// await dbClient.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));

	const hashedToken = encodeJwtToken(
		{ token: rawToken },
		{
			schema: z.object({
				token: z.string(),
			}),
		}
	);

	await dbClient
		.insert(passwordResetTokens)
		.values({
			email: user.email,
			expiresAt: tokenExpiry,
			token: hashedToken,
			userId: user.id,
		})
		.onConflictDoUpdate({
			set: {
				email: user.email,
				expiresAt: tokenExpiry,
				token: hashedToken,
			},
			target: passwordResetTokens.userId,
		});

	await addEmailToQueue({
		data: {
			name: user.firstName,
			priority: "high",
			to: user.email,
			token: hashedToken,
		},
		onError: async () => {
			await dbClient.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
		},
		type: "resetPassword",
	});
};
