import { definePlugin } from "@zayne-labs/callapi/utils";
import { isServer } from "@zayne-labs/toolkit-core";

export type NextjsForwardCookiesMeta = {
	forwardCookies?: unknown;
};

/**
 * @description A plugin to forward cookies from Next.js server context to the backend API.
 * This is essential for Server Components to be able to authenticate with the backend.
 */
export const nextjsForwardCookiesPlugin = () => {
	return definePlugin({
		id: "nextjs-forward-cookies-plugin",
		name: "nextjsForwardCookiesPlugin",

		setup: async (ctx) => {
			if (!isServer() || ctx.request.headers.cookie) return;

			try {
				const headerStore = await import("next/headers").then((pkg) => pkg.headers());
				const cookieHeader = headerStore.get("cookie");

				if (!cookieHeader) return;

				ctx.request.headers.cookie = cookieHeader;
			} catch {
				// Handle cases where headers() might be called outside of request context
				console.warn("NextjsForwardCookiesPlugin: Failed to access headers context.");
			}
		},
	});
};
