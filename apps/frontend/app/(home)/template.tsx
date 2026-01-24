"use client";

import { sessionQuery } from "@/lib/react-query/queryOptions";
import { HydrationBoundary } from "../HydrationBoundary.client";

function HomeTemplate({ children }: LayoutProps<"/">) {
	return (
		// FIXME - Remove later if you can fix the issue coming from next-forward-cookies plugin, which makes pages unable to be statically generated
		<HydrationBoundary onPrefetch={(client) => client.prefetchQuery(sessionQuery())}>
			{children}
		</HydrationBoundary>
	);
}

export default HomeTemplate;
