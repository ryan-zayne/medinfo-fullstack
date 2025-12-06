"use client";

import { NavLink } from "@/components/common";
import { sessionQuery } from "@/lib/react-query/queryOptions";
import { useQuery } from "@tanstack/react-query";
import type { InferProps } from "@zayne-labs/toolkit-react/utils";

function CallToActionLink(props: Omit<InferProps<typeof NavLink>, "href">) {
	const sessionQueryResult = useQuery(sessionQuery());

	const userSession = sessionQueryResult.data?.data.user;

	return (
		<NavLink
			href={{
				pathname: userSession ? `/dashboard/${userSession.role}` : "/auth/signin",
				query: { user: "patient" },
			}}
			{...props}
		>
			{userSession ? "Dashboard" : "Join us"}
		</NavLink>
	);
}

export { CallToActionLink };
