import { db } from "@medinfo/db";
import { emailVerificationCodes, type SelectUserType } from "@medinfo/db/schema/auth";
import { eq } from "drizzle-orm";
import { ENVIRONMENT } from "@/config/env";
import { addEmailToQueue } from "@/services/queues";
import { generateRandom6DigitKey } from "./common";
import { hashValue } from "./hash";

export const sendVerificationEmail = async (user: Pick<SelectUserType, "email" | "firstName" | "id">) => {
	const code = generateRandom6DigitKey();

	const hashedCode = await hashValue(code);

	const codeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

	await db
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

	const FRONTEND_URL =
		ENVIRONMENT.NODE_ENV === "development" ?
			ENVIRONMENT.BASE_FRONTEND_HOST_DEV
		:	ENVIRONMENT.BASE_FRONTEND_HOST;

	await addEmailToQueue({
		data: {
			name: user.firstName,
			to: user.email,
			validationCode: code,
			validationUrl: `${FRONTEND_URL}/auth/verify-email?${new URLSearchParams({ code, email: user.email }).toString()}`,
		},
		onError: async () => {
			await db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.userId, user.id));
		},
		type: "verifyEmail",
	});
};
