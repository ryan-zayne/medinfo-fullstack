import { sessionQuery } from "@/lib/react-query/queryOptions";
import { HydrationBoundary } from "../HydrationBoundary";

function HomeLayout({ children }: LayoutProps<"/dashboard/doctor">) {
	return (
		<HydrationBoundary onPrefetch={(client) => client.prefetchQuery(sessionQuery())}>
			{children}
		</HydrationBoundary>
	);
}

export default HomeLayout;
