import type { AppRoutes as AppRouteTypes } from "./.next/dev/types/routes";

declare global {
	export type AppRoutes = AppRouteTypes;
}
