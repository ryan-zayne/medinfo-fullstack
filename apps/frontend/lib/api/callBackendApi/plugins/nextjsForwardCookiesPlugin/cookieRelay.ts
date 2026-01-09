import { checkUserSession } from "../utils/session";

export const handleCookieRelay = async (nextjsRequest: Request, nextjsResponse: Response) => {
	const cookieHeader = nextjsRequest.headers.get("cookie");

	if (!cookieHeader) return;

	const hasRefreshToken = cookieHeader.includes("zayneRefreshToken");
	const hasAccessToken = cookieHeader.includes("zayneAccessToken");

	if (!hasRefreshToken || hasAccessToken) return;

	await checkUserSession({
		headers: {
			Cookie: cookieHeader,
		},

		onResponse: (ctx) => {
			const responseCookies = ctx.response.headers.get("set-cookie");

			if (!responseCookies) return;

			// == Attach the backend's Set-Cookie header to the outgoing Next.js response.
			nextjsResponse.headers.set("set-cookie", responseCookies);
		},

		plugins: [],
	});

	return nextjsResponse;
};
