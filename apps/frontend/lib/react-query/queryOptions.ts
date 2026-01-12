import { queryOptions } from "@tanstack/react-query";
import { callBackendApiForQuery } from "@/lib/api/callBackendApi";
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

export const healthTipsQuery = (options: { tipId?: string } = {}) => {
	const { tipId } = options;

	return queryOptions({
		queryFn: () => {
			return callBackendApiForQuery("@get/health-tips/all", {
				meta: { toast: { success: false } },
				query: { limit: 10 },
			});
		},
		queryKey: ["health-tips", tipId ? `page-id-${tipId}` : "home-page"],
		staleTime: Infinity,
	});
};

export const allDiseasesQuery = () => {
	return queryOptions({
		queryFn: () => {
			return callBackendApiForQuery("@get/diseases/all", {
				meta: { toast: { success: false } },
			});
		},
		queryKey: ["diseases"],
		staleTime: Infinity,
	});
};

export const patientAppointmentsQuery = () => {
	return queryOptions({
		queryFn: () => {
			return callBackendApiForQuery("@get/appointments/patient/all", {
				meta: { toast: { success: false } },
				query: { limit: 100 },
			});
		},
		queryKey: ["appointments", "patient"],
	});
};

export type PatientAppointmentQueryResultType = Awaited<
	ReturnType<NonNullable<ReturnType<typeof patientAppointmentsQuery>["select"]>>
>;
