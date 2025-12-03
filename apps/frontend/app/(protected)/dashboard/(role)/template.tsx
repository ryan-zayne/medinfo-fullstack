"use client";

import { usePageBlocker } from "@/lib/hooks";
import { sessionQuery } from "@/lib/react-query/queryOptions";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

function RoleDashboardTemplate({ children }: { children: React.ReactNode }) {
	const sessionQueryResult = useQuery(sessionQuery());

	const pathName = usePathname();

	const pathNameParts = pathName.split("/");

	const roleFromPath = pathNameParts[2];

	const isMatchingRole = sessionQueryResult.data?.data.user.role === roleFromPath;

	usePageBlocker({
		condition: !isMatchingRole,
		message: `You do not have access to this ${roleFromPath} dashboard as you are a ${sessionQueryResult.data?.data.user.role}`,
		redirectPath: "/",
	});

	if (!isMatchingRole) {
		return null;
	}

	return children;
}

export default RoleDashboardTemplate;
