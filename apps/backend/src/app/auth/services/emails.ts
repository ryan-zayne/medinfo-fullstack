import type { SelectUserType } from "@medinfo/db/schema/auth";
import { ENVIRONMENT } from "@/config/env";
import { removeFromCache, setCache } from "@/services/cache";
import { addEmailToQueue } from "@/services/queues";
import { generateRandom6DigitKey } from "./common";
import { hashValue } from "./hash";

export const sendVerificationEmail = async (user: SelectUserType) => {
	const emailVerificationCode = generateRandom6DigitKey();

	const hashedCode = await hashValue(emailVerificationCode);

	await setCache(`verify-email-code:${user.email}`, JSON.stringify(hashedCode), { expiry: 15 * 60 });

	const FRONTEND_URL =
		ENVIRONMENT.NODE_ENV === "development" ?
			ENVIRONMENT.BASE_FRONTEND_HOST_DEV
		:	ENVIRONMENT.BASE_FRONTEND_HOST;

	await addEmailToQueue({
		data: {
			name: user.firstName,
			to: user.email,
			validationCode: emailVerificationCode,
			validationUrl: `${FRONTEND_URL}/auth/verify-email?email=${user.email}&code=${emailVerificationCode}`,
		},

		onError: async () => {
			await removeFromCache(`verify-email-code:${user.email}`);
		},

		type: "verifyEmail",
	});
};
