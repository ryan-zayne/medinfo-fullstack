import crypto from "node:crypto";
import type { SelectUserType } from "@medinfo/db/schema/auth";
import { pickKeys } from "@zayne-labs/toolkit-core";
import { necessaryUserDetails } from "./constants";

export const getNecessaryUserDetails = <const TKeys extends Array<keyof SelectUserType> = []>(
	user: SelectUserType,
	keys: TKeys = [] as never
) => {
	return pickKeys(user, [...necessaryUserDetails, ...keys] as const);
};

export const generateRandom6DigitKey = () => {
	const randomNum = crypto.randomInt(0, 1000000).toString().padStart(6, "0");

	return randomNum;
};
