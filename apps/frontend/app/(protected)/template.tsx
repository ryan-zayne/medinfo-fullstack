"use client";

import { useQuery } from "@tanstack/react-query";
import { sessionQuery } from "@/lib/react-query/queryOptions";
import { LoadingScreen } from "../-components/LoadingScreen";

function ProtectedTemplate({ children }: LayoutProps<"/">) {
	const sessionQueryResult = useQuery(sessionQuery());

	if (sessionQueryResult.data) {
		return children;
	}

	return <LoadingScreen />;
}

export default ProtectedTemplate;
