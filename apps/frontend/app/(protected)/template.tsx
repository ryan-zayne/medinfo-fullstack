"use client";

import { useQuery } from "@tanstack/react-query";
import { sessionQuery } from "@/lib/react-query/queryOptions";
import { LoadingScreen } from "../-components/LoadingScreen";
import { HydrationBoundary } from "../HydrationBoundary.client";

function ProtectedTemplate({ children }: { children: React.ReactNode }) {
	const sessionQueryResult = useQuery(sessionQuery());

	if (sessionQueryResult.data) {
		return (
			// FIXME - Remove later if you can fix the issue coming from next-forward-cookies plugin, which makes pages unable to be statically generated
			<HydrationBoundary onPrefetch={(client) => client.prefetchQuery(sessionQuery())}>
				{children}
			</HydrationBoundary>
		);
	}

	return <LoadingScreen />;
}

export default ProtectedTemplate;
