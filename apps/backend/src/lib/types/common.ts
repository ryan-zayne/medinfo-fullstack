import type { SelectUserType } from "@medinfo/db/schema/auth";
import type { PinoLogger } from "hono-pino";

export type HonoAppBindings = {
	Variables: {
		currentUser: SelectUserType;
		logger: PinoLogger;
	};
};
