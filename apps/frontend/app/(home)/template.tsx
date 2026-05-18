"use client";

import { sessionQuery } from "@/lib/react-query/queryOptions";
import { HydrationBoundary } from "../HydrationBoundary";

function HomeTemplate({ children }: LayoutProps<"/">) {
	return <HydrationBoundary queries={[sessionQuery()]}>{children}</HydrationBoundary>;
}

export default HomeTemplate;
