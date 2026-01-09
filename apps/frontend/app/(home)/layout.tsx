import { healthTipsQuery, sessionQuery } from "@/lib/react-query/queryOptions";
import { HydrationBoundary } from "../HydrationBoundary";
import { Footer, NavBar } from "./-components";

function HomeLayout({ children }: LayoutProps<"/">) {
	return (
		<div className="flex min-h-svh w-full flex-col items-center">
			<HydrationBoundary
				onPrefetch={(client) => [
					client.prefetchQuery(sessionQuery()),
					client.prefetchQuery(healthTipsQuery()),
				]}
			>
				<NavBar />
				{children}
			</HydrationBoundary>
			<Footer />
		</div>
	);
}

export default HomeLayout;
