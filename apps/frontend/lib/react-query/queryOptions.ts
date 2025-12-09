import { callBackendApiForQuery } from "@/lib/api/callBackendApi";
import { queryOptions } from "@tanstack/react-query";
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
