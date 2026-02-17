"use client";

import { useQuery } from "@tanstack/react-query";
import type { InferProps } from "@zayne-labs/toolkit-react/utils";
import { NavLink } from "@/components/common";
import { Button } from "@/components/ui/button";
import { sessionQuery } from "@/lib/react-query/queryOptions";

function CallToActionLink(
	props: Omit<InferProps<typeof NavLink>, "href"> & { buttonProps?: InferProps<typeof Button> }
) {
	const { buttonProps, ...restOfProps } = props;
	const sessionQueryResult = useQuery(sessionQuery());

	const userSession = sessionQueryResult.data?.data.user;

	return (
		<Button asChild={true} {...buttonProps}>
			<NavLink
				href={{
					pathname: userSession ? `/dashboard/${userSession.role}` : "/auth/signin",
					...(!userSession && { query: { user: "patient" } }),
				}}
				{...restOfProps}
			>
				{userSession ? "Dashboard" : "Join us"}
			</NavLink>
		</Button>
	);
}

export { CallToActionLink };
