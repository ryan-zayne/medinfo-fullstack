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
		queryKey: ["health-tips", ...(tipId ? [tipId] : [])],
		staleTime: Infinity,
	});
};
