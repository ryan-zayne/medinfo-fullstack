import { callBackendApiForQuery } from "@/lib/api/callBackendApi";
import { queryOptions } from "@tanstack/react-query";
import type { CallApiExtraOptions } from "@zayne-labs/callapi";
import { checkUserSessionForQuery } from "../api/callBackendApi/plugins/utils/session";

export const sessionQuery = () => {
	return queryOptions({
		queryFn: () => checkUserSessionForQuery(),
		queryKey: ["session"],
		staleTime: Infinity,
	});
};

export type SessionQueryResultType = Awaited<
	ReturnType<NonNullable<ReturnType<typeof sessionQuery>["select"]>>
>;

export const healthTipsQuery = (options: { pageName?: string } = {}) => {
	const { pageName = "home-page" } = options;

	return queryOptions({
		queryFn: () => {
			return callBackendApiForQuery("@get/health-tips/all", {
				meta: { toast: { success: false } },
				query: { limit: 8 },
			});
		},
		queryKey: ["health-tips", pageName],
		staleTime: Infinity,
	});
};

export const matchDoctorsQuery = (
	options?: Pick<CallApiExtraOptions, "onError"> & {
		formData?: Record<string, unknown> | null;
	}
) => {
	const { formData, onError } = options ?? {};

	return queryOptions({
		enabled: Boolean(formData),
		queryFn: () => {
			return callBackendApiForQuery("/appointments/match-doctors", {
				body: formData,
				method: "POST",
				onError,
			});
		},
		// eslint-disable-next-line tanstack-query/exhaustive-deps
		queryKey: ["appointments", "match-doctors", formData],
		retry: false,
		staleTime: Infinity,
	});
};

export const bookAppointmentQuery = (
	options?: Pick<CallApiExtraOptions, "onError" | "onSuccess"> & { doctorId?: string }
) => {
	const { doctorId = "", onError, onSuccess } = options ?? {};

	return queryOptions({
		enabled: Boolean(doctorId),
		queryFn: () => {
			return callBackendApiForQuery("/appointments/:doctorId", {
				method: "POST",
				onError,
				onSuccess,
				params: { doctorId },
			});
		},
		// eslint-disable-next-line tanstack-query/exhaustive-deps
		queryKey: ["appointments", "book-appointment", doctorId],
		retry: false,
		staleTime: Infinity,
	});
};
