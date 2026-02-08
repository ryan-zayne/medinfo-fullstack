import crypto from "node:crypto";
import type { SelectUserType } from "@medinfo/db/schema/auth";
import { pickKeys } from "@zayne-labs/toolkit-core";
import { ENVIRONMENT } from "@/config/env";
import { setCache } from "@/services/cache";
import { addEmailToQueue } from "@/services/queues";
import { necessaryUserDetails } from "./constants";
import { hashValue } from "./hash";

export const getNecessaryUserDetails = (user: SelectUserType, keys: Array<keyof SelectUserType> = []) => {
	return pickKeys(user, [...necessaryUserDetails, ...keys]);
};

const generateRandom6DigitKey = () => {
	const randomNum = crypto.randomInt(0, 1000000).toString().padStart(6, "0");

	return randomNum;
};

export const sendVerificationEmail = async (user: SelectUserType) => {
	const emailVerificationCode = generateRandom6DigitKey();

	const hashedCode = await hashValue(emailVerificationCode);

	await setCache(`verify-email-code:${user.id}`, hashedCode, { expiry: 15 * 60 });

	const FRONTEND_URL =
		ENVIRONMENT.NODE_ENV === "development" ?
			ENVIRONMENT.BASE_FRONTEND_HOST_DEV
		:	ENVIRONMENT.BASE_FRONTEND_HOST_PROD;

	await addEmailToQueue({
		data: {
			name: user.firstName,
			to: user.email,
			validationCode: emailVerificationCode,
			validationUrl: `${FRONTEND_URL}/auth/verify-email?code=${emailVerificationCode}`,
		},
		type: "verifyEmail",
	});
};
