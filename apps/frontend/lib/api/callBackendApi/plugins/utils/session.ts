import type { CallApiConfig } from "@zayne-labs/callapi";
import { callBackendApi, callBackendApiForQuery, type GlobalMeta } from "../../callBackendApi";

export const checkUserSessionForQuery = () => {
	return callBackendApiForQuery("@get/auth/session", {
		dedupeKey: (ctx) => ctx.options.initURL,
		dedupeStrategy: "defer",
		meta: { toast: { success: false } },
	});
};

export const checkUserSession = (options?: CallApiConfig<{ Meta: GlobalMeta }>) => {
	return callBackendApi("@get/auth/session", {
		dedupeKey: (ctx) => ctx.options.initURL,
		dedupeStrategy: "defer",
		...(options as object),
		meta: { toast: { success: false }, ...options?.meta },
	});
};
