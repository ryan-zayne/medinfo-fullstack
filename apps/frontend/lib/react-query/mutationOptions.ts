import { mutationOptions } from "@tanstack/react-query";
import type { z } from "zod";
import type { backendApiSchemaRoutes, SignUpSchema } from "@/lib/api/callBackendApi/apiSchema";
import { callBackendApiForQuery } from "../api/callBackendApi";

export const googleOAuthMutation = () => {
	return mutationOptions({
		mutationFn: (queryData: Pick<z.infer<typeof SignUpSchema>, "role">) => {
			return callBackendApiForQuery("@get/auth/google", {
				meta: { toast: { success: false } },
				query: queryData,
			});
		},

		mutationKey: ["oauth", "google"],
	});
};

export const signoutMutation = () => {
	return mutationOptions({
		mutationFn: () => {
			return callBackendApiForQuery("@get/auth/signout");
		},
		mutationKey: ["auth", "signout"],
	});
};

export const matchDoctorMutation = () => {
	return mutationOptions({
		mutationFn: (
			bodyData: z.infer<(typeof backendApiSchemaRoutes)["@post/appointments/match-doctor"]["body"]>
		) => {
			return callBackendApiForQuery("@post/appointments/match-doctor", {
				body: bodyData,
				meta: { toast: { success: false } },
			});
		},

		mutationKey: ["appointments", "match-doctor"],
	});
};

export type MatchDoctorMutationResultType = Awaited<
	ReturnType<NonNullable<ReturnType<typeof matchDoctorMutation>["mutationFn"]>>
>;

export const bookAppointmentMutation = () => {
	return mutationOptions({
		mutationFn: (
			bodyData: z.infer<(typeof backendApiSchemaRoutes)["@post/appointments/book"]["body"]>
		) => {
			return callBackendApiForQuery("@post/appointments/book", {
				body: bodyData,
			});
		},
		mutationKey: ["appointments", "book"],
	});
};

export const cancelAppointmentMutation = () => {
	return mutationOptions({
		mutationFn: (
			bodyData: z.infer<(typeof backendApiSchemaRoutes)["@delete/appointments/cancel"]["body"]>
		) => {
			return callBackendApiForQuery("@delete/appointments/cancel", {
				body: bodyData,
			});
		},
		mutationKey: ["appointments", "cancel"],
	});
};
export const updateAppointmentStatusMutation = () => {
	return mutationOptions({
		mutationFn: (
			bodyData: z.infer<(typeof backendApiSchemaRoutes)["@patch/appointments/status"]["body"]>
		) => {
			return callBackendApiForQuery("@patch/appointments/status", {
				body: bodyData,
			});
		},
		mutationKey: ["appointments", "status"],
	});
};

export const resendVerificationEmailMutation = () => {
	return mutationOptions({
		mutationFn: (bodyData: { email: string }) => {
			return callBackendApiForQuery("@post/auth/resend-verification-email", {
				body: bodyData,
				meta: { toast: { success: true } },
			});
		},
		mutationKey: ["auth", "resend-verification-email"],
	});
};
