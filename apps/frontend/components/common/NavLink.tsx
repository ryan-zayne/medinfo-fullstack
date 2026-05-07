"use client";

import type { UrlObject } from "node:url";
import { isString } from "@zayne-labs/toolkit-type-helpers";
import type { Route } from "next";
import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import type { AppRoutes } from "@/.next/dev/types/routes";
import { cnMerge } from "@/lib/utils/cn";

export type MainAppRoutes<TRouteType extends string = AppRoutes> = Route<TRouteType>;

function NavLink<TRouteType extends string = AppRoutes>(
	props: Omit<LinkProps<TRouteType>, "href"> & {
		href:
			| (Omit<UrlObject, "pathname"> & { pathname: MainAppRoutes<TRouteType> })
			| MainAppRoutes<TRouteType>;
		transitionType?: "navbar" | "no-transition" | "regular";
	}
) {
	const { children, className, href, transitionType = "no-transition", ...restOfProps } = props;

	const pathname = usePathname();

	const isActive = isString(href) ? pathname === href : pathname === href.pathname;

	return (
		<Link
			href={href}
			data-active={isActive}
			className={cnMerge(
				transitionType !== "no-transition" && "nav-link-transition",
				// eslint-disable-next-line tailwindcss-better/no-unknown-classes
				transitionType === "navbar" && "nav-mobile",
				className
			)}
			{...restOfProps}
		>
			{children}
		</Link>
	);
}

export { NavLink };
