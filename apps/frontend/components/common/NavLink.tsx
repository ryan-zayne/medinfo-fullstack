"use client";

import type { UrlObject } from "node:url";
import type { InferProps } from "@zayne-labs/toolkit-react/utils";
import { isString, type AnyString } from "@zayne-labs/toolkit-type-helpers";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cnMerge } from "@/lib/utils/cn";

const isRelativeLink = (value: string | UrlObject | null | undefined): value is string => {
	return isString(value) && !value.startsWith("/");
};

export type MainAppRoutes<TAppRoutes extends AppRoutes = AppRoutes> =
	TAppRoutes extends `${infer TPrefix}/[${string}]` ? `${TPrefix}/${AnyString}` : TAppRoutes;

type ModifiedHref = "#" | (Omit<UrlObject, "pathname"> & { pathname?: MainAppRoutes }) | MainAppRoutes;

function NavLink(
	props: Omit<InferProps<typeof Link>, "href"> & {
		href: ModifiedHref;
		relative?: boolean;
		transitionType?: "navbar" | "no-transition" | "regular";
	}
) {
	const { children, className, href, transitionType = "no-transition", ...restOfProps } = props;

	const pathname = usePathname();

	if (!isString(href) && isRelativeLink(href.pathname)) {
		Reflect.set(href, "pathname", `${pathname}/${href.pathname}`);
	}

	const resolvedHref =
		isString(href) && isRelativeLink(href) ? `${pathname}/${href.replaceAll(" ", "")}` : href;

	const isActive =
		isString(resolvedHref) ? pathname === resolvedHref : pathname === resolvedHref.pathname;

	return (
		<Link
			prefetch={false}
			href={resolvedHref}
			data-active={isActive}
			className={cnMerge(
				transitionType !== "no-transition" && "nav-link-transition relative",
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
