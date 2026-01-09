import { NextResponse, type NextProxy, type ProxyConfig } from "next/server";
import { handleCookieRelay } from "./lib/api/callBackendApi/plugins/nextjsForwardCookiesPlugin/cookieRelay";

export const proxy: NextProxy = (nextjsRequest) => {
	const nextjsResponse = NextResponse.next();

	return handleCookieRelay(nextjsRequest, nextjsResponse);
};

export const config: ProxyConfig = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
