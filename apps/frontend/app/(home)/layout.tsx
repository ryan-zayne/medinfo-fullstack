import { sessionQuery } from "@/lib/react-query/queryOptions";
import { HydrationBoundary } from "../HydrationBoundary.client";
import { Footer, NavBar } from "./-components";

function HomeLayout({ children }: LayoutProps<"/">) {
	return (
		// FIXME - Use the server component one if you can fix the issue coming from next-forward-cookies plugin, which makes pages unable to be statically generated
		<HydrationBoundary onPrefetch={(client) => client.prefetchQuery(sessionQuery())}>
			<div className="flex min-h-svh w-full flex-col items-center">
				<NavBar />
				{children}
				<Footer />
			</div>
		</HydrationBoundary>
	);
}

export default HomeLayout;
