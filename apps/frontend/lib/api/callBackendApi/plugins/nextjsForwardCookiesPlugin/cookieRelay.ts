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
		headers: { Cookie: cookieHeader },
		plugins: [],
		resultMode: "fetchApi",
	});

	// getSetCookie() returns each Set-Cookie header as a separate array entry
	const responseCookies = backendResponse?.headers.getSetCookie();

	if (!responseCookies?.length) return;

	for (const cookie of responseCookies) {
		nextjsResponse.headers.append("set-cookie", cookie);
	}

	return nextjsResponse;
};
