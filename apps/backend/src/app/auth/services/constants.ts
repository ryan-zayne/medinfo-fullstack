import type { SelectUserType } from "@medinfo/backend-db/schema/auth";
import { defineEnum } from "@zayne-labs/toolkit-type-helpers";

export const necessaryUserDetails = defineEnum([
	"firstName",
	"lastName",
	"email",
	"avatar",
	"role",
	"medicalLicense",
	"specialty",
] satisfies Array<keyof SelectUserType>);
