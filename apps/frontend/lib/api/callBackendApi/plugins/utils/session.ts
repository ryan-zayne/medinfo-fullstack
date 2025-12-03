import { callBackendApi, callBackendApiForQuery } from "../../callBackendApi";

export const checkUserSessionForQuery = () => {
	return callBackendApiForQuery("@get/auth/session", {
		dedupeStrategy: "defer",
		meta: { toast: { success: false } },
	});
};

export const checkUserSession = () => {
	return callBackendApi("@get/auth/session", {
		dedupeStrategy: "defer",
		meta: { toast: { success: false } },
	});
};
