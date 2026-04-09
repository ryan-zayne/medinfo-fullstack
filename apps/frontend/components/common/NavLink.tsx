"use client";

import type { UrlObject } from "node:url";
import type { InferProps } from "@zayne-labs/toolkit-react/utils";
import { isString, type AnyString } from "@zayne-labs/toolkit-type-helpers";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppRoutes } from "@/.next/dev/types/routes";
import { cnMerge } from "@/lib/utils/cn";

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

	const isActive = isString(href) ? pathname === href : pathname === href.pathname;

	return (
		<Link
			href={href}
			data-active={isActive}
			className={cnMerge(
				transitionType !== "no-transition" && "nav-link-transition relative",
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
