import { backendApiSchema } from "@medinfo/shared/validation/backendApiSchema";
import { createFetchClientWithContext } from "@zayne-labs/callapi";
import { loggerPlugin } from "@zayne-labs/callapi-plugins";
import { defineBaseConfig } from "@zayne-labs/callapi/utils";
import { toastPlugin, type ToastPluginMeta } from "./plugins";
import {
	authErrorRedirectPlugin,
	type AuthErrorRedirectPluginMeta,
} from "./plugins/authErrorRedirectPlugin";

type GlobalMeta = AuthErrorRedirectPluginMeta & ToastPluginMeta;

// declare module "@zayne-labs/callapi" {
// interface Register {
// 	meta: GlobalMeta;
// }
// }

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
		authErrorRedirectPlugin({
			redirectRoute: "/auth/signin",
			routesToExemptFromErrorRedirect: ["/", "/library/**", "/daily-tips/**", "/auth/**"],
		}),
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

const createFetchClient = createFetchClientWithContext<{ Meta: GlobalMeta }>();

export const callBackendApi = createFetchClient(sharedBaseConfig);

export const callBackendApiForQuery = createFetchClient({
	...sharedBaseConfig,
	resultMode: "onlyData",
	throwOnError: true,
});
