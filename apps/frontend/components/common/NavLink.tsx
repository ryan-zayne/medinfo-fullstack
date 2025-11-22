"use client";

import { cnMerge } from "@/lib/utils/cn";
import type { InferProps } from "@zayne-labs/toolkit-react/utils";
import { isString } from "@zayne-labs/toolkit-type-helpers";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UrlObject } from "node:url";

const isRelativeLink = (value: string | UrlObject | null | undefined): value is string => {
	return isString(value) && !value.startsWith("/");
};

function NavLink(
	props: InferProps<typeof Link> & {
		relative?: boolean;
		transitionType?: "navbar" | "no-transition" | "regular";
	}
) {
	const { children, className, href, transitionType = "no-transition", ...restOfProps } = props;

	const pathname = usePathname();

	if (!isString(href) && isRelativeLink(href.pathname)) {
		Reflect.set(href, "pathname", `${pathname}/${href.pathname}`);
	}

	return (
		<Link
			prefetch={false}
			href={isRelativeLink(href) ? `${pathname}/${href.replaceAll(" ", "")}` : href}
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

export default NavLink;
