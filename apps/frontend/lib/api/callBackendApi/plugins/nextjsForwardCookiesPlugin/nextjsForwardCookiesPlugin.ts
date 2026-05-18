import type { PluginSetupContext } from "@zayne-labs/callapi";
import { definePlugin } from "@zayne-labs/callapi/utils";
import { isServer } from "@zayne-labs/toolkit-core";
import { connection } from "next/server";

export type NextjsForwardCookiesMeta = {
	nextjsForwardCookies?: {
		enabled?: boolean;
	};
};

/**
 * @description A plugin to forward cookies from Next.js server context to the backend API.
 * This is essential for Server Components to be able to authenticate with the backend.
 * Can only be used in dynamic routes
 */
export const nextjsForwardCookiesPlugin = (
	nextjsForwardCookiesOptions?: NextjsForwardCookiesMeta["nextjsForwardCookies"]
) => {
	const getNextjsForwardCookiesMeta = (ctx: PluginSetupContext<{ Meta: NextjsForwardCookiesMeta }>) => {
		const nextjsForwardCookiesMeta =
			nextjsForwardCookiesOptions ?
				{ ...nextjsForwardCookiesOptions, ...ctx.options.meta?.nextjsForwardCookies }
			:	ctx.options.meta?.nextjsForwardCookies;

		return nextjsForwardCookiesMeta;
	};

	return definePlugin({
		id: "nextjs-forward-cookies-plugin",
		name: "nextjsForwardCookiesPlugin",

		setup: async (ctx: PluginSetupContext<{ Meta: NextjsForwardCookiesMeta }>) => {
			if (!isServer() || ctx.request.headers.cookie) return;

			const nextjsForwardCookiesMeta = getNextjsForwardCookiesMeta(ctx);

			if (!nextjsForwardCookiesMeta?.enabled) return;

			try {
				await connection();
				const headerStore = await import("next/headers").then((pkg) => pkg.headers());
				const cookieHeader = headerStore.get("cookie");

				if (!cookieHeader) return;

				// eslint-disable-next-line require-atomic-updates
				ctx.request.headers.cookie = cookieHeader;
			} catch (error) {
				console.warn("NextjsForwardCookiesPlugin: Failed to access headers context.", error);
			}
		},
	});
};
