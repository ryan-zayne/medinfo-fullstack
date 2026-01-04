import type { SelectUserType } from "@medinfo/db/schema/auth";
import { pickKeys } from "@zayne-labs/toolkit-core";
import { necessaryUserDetails } from "./constants";

export const getNecessaryUserDetails = (user: SelectUserType, keys: Array<keyof SelectUserType> = []) => {
	return pickKeys(user, [...necessaryUserDetails, ...keys]);
};
