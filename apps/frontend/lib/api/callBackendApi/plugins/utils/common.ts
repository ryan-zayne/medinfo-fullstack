import type { ResponseErrorContext } from "@zayne-labs/callapi";
import { isHTTPError } from "@zayne-labs/callapi/utils";
import { hardNavigate, isBrowser } from "@zayne-labs/toolkit-core";
import type { AppRoutes } from "@/.next/dev/types/routes";

export const isAuthError = (error: ResponseErrorContext["error"]) => {
	return isHTTPError(error) && error.originalError.response.status === 401;
};

export const isAuthErrorThatNeedsRedirect = (error: ResponseErrorContext["error"]) => {
	return isAuthError(error) && error.message.includes("log in");
};

export const redirectTo = (route: AppRoutes) => {
	setTimeout(() => hardNavigate(route), 1500);
};

export const isPathnameMatchingRoute = (route: string) => {
	if (!isBrowser()) {
		return false;
	}

	const isCatchAllRoute = route.endsWith("/**");

	const pathname = globalThis.location.pathname;

	if (isCatchAllRoute) {
		const actualRoute = route.slice(0, -3);

		return pathname.includes(actualRoute);
	}

	return pathname.endsWith(route);
};
