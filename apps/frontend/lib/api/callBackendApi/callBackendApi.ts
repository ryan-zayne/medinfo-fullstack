import { backendApiSchema } from "@medinfo/shared/validation/backendApiSchema";
import { createFetchClient } from "@zayne-labs/callapi";
import { loggerPlugin } from "@zayne-labs/callapi-plugins";
import { defineBaseConfig } from "@zayne-labs/callapi/utils";
import { toastPlugin, type ToastPluginMeta } from "./plugins";

type GlobalMeta = ToastPluginMeta;

declare module "@zayne-labs/callapi" {
	// eslint-disable-next-line ts-eslint/consistent-type-definitions
	interface Register {
		meta: GlobalMeta;
	}
}

const REMOTE_BACKEND_HOST = "https://api-medical-info.onrender.com";

const LOCAL_BACKEND_HOST = "http://localhost:8000";

const BACKEND_HOST = process.env.NODE_ENV === "development" ? LOCAL_BACKEND_HOST : REMOTE_BACKEND_HOST;
// const BACKEND_HOST = REMOTE_BACKEND_HOST;

export const BASE_API_URL = `${BACKEND_HOST}/api/v1`;

export const sharedBaseConfig = defineBaseConfig({
	baseURL: BASE_API_URL,
	credentials: "include",
	dedupe: {
		cacheScope: "global",
		cacheScopeKey: (ctx) => ctx.options.baseURL,
	},

	plugins: [
		toastPlugin({
			errorAndSuccess: true,
			errorsToSkip: ["AbortError"],
		}),
		loggerPlugin({
			enabled: { onError: true },
		}),
	],

	resultMode: "withoutResponse",

	schema: backendApiSchema,
});

export const callBackendApi = createFetchClient(sharedBaseConfig);

export const callBackendApiForQuery = createFetchClient({
	...sharedBaseConfig,
	resultMode: "onlyData",
	throwOnError: true,
});
