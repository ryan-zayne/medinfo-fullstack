import type { SignUpSchema } from "@medinfo/shared/validation/backendApiSchema";
import { mutationOptions } from "@tanstack/react-query";
import type { z } from "zod";
import { callBackendApiForQuery } from "../api/callBackendApi";

export const googleOAuthMutation = () => {
	return mutationOptions({
		mutationFn: (options: Pick<z.infer<typeof SignUpSchema>, "role">) => {
			const { role } = options;

			return callBackendApiForQuery("@get/auth/google", {
				onSuccess: (ctx) => {},
				meta: { toast: { success: false } },
				query: { role },
			});
		},
		mutationKey: ["auth", "google"],
	});
};
