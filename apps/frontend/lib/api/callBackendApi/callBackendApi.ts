import { backendApiSchema } from "@medinfo/shared/validation/backendApiSchema";
import { createFetchClientWithContext, type GetCallApiContext } from "@zayne-labs/callapi";
import { loggerPlugin } from "@zayne-labs/callapi-plugins";
import { defineBaseConfig } from "@zayne-labs/callapi/utils";
import { BASE_API_URL } from "./constants";
import {
	authErrorRedirectPlugin,
	toastPlugin,
	type AuthErrorRedirectPluginMeta,
	type NextjsForwardCookiesMeta,
	type ToastPluginMeta,
} from "./plugins";

export type GlobalMeta = AuthErrorRedirectPluginMeta & NextjsForwardCookiesMeta & ToastPluginMeta;

export const sharedBaseConfig = defineBaseConfig({
	baseURL: BASE_API_URL,
	credentials: "include",

	dedupeCacheScope: "global",
	dedupeCacheScopeKey: (ctx) => ctx.options.baseURL,

	plugins: [
		// nextjsForwardCookiesPlugin(),
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

const createFetchClient = createFetchClientWithContext<GetCallApiContext<{ Meta: GlobalMeta }>>();

export const callBackendApi = createFetchClient(sharedBaseConfig);

export const callBackendApiForQuery = createFetchClient({
	...sharedBaseConfig,
	resultMode: "onlyData",
	throwOnError: true,
});
