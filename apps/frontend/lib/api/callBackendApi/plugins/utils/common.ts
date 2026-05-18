import type { ResponseErrorContext } from "@zayne-labs/callapi";
import { isHTTPError } from "@zayne-labs/callapi/utils";
import { hardNavigate, isBrowser } from "@zayne-labs/toolkit-core";
import type { MainAppRoutes } from "@/components/common/NavLink";

export const isAuthError = (error: ResponseErrorContext["error"]) => {
	return isHTTPError(error) && error.originalError.response.status === 401;
};

export const isAuthErrorThatNeedsRedirect = (error: ResponseErrorContext["error"]) => {
	return isAuthError(error) && error.message.includes("log in");
};

export const redirectTo = (route: MainAppRoutes) => {
	setTimeout(() => hardNavigate(route), 1500);
};

export const isPathnameMatchingRoute = (route: string) => {
	if (!isBrowser()) {
		return false;
	}

	const pathname = globalThis.location.pathname;

	const isRouteWithCatchAll = route.endsWith("/**");

	if (isRouteWithCatchAll) {
		const routeWithoutCatchAll = route.slice(0, -3);

		return pathname === routeWithoutCatchAll || pathname.startsWith(`${routeWithoutCatchAll}/`);
	}

	return pathname === route;
};
