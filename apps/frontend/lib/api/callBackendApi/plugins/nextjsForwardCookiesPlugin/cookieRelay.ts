import { callBackendApi } from "../../callBackendApi";
import { sessionDedupeOptions } from "../utils/session";

export const handleCookieRelay = async (nextjsRequest: Request, nextjsResponse: Response) => {
	const cookieHeader = nextjsRequest.headers.get("cookie");

	if (!cookieHeader) return;

	const hasRefreshToken = cookieHeader.includes("zayneRefreshToken");
	const hasAccessToken = cookieHeader.includes("zayneAccessToken");

	if (!hasRefreshToken || hasAccessToken) return;

	const backendResponse = await callBackendApi("@get/auth/session", {
		...sessionDedupeOptions,
		headers: {
			Cookie: cookieHeader,
		},
		// == Turn off all base plugins
		plugins: [],
		resultMode: "fetchApi",
	});

	const responseCookies = backendResponse?.headers.get("set-cookie");

	if (!responseCookies) return;

	// == Attach the backend's Set-Cookie header to the outgoing Next.js response.
	nextjsResponse.headers.set("set-cookie", responseCookies);

	return nextjsResponse;
};
