import type { SelectUserType } from "@medinfo/db/schema/auth";
import { defineEnum } from "@zayne-labs/toolkit-type-helpers";

export const necessaryUserDetails = defineEnum([
	"firstName",
	"lastName",
	"fullName",
	"email",
	"avatar",
	"role",
	"medicalLicense",
	"specialty",
	"bio",
	"city",
] satisfies Array<keyof SelectUserType>);
