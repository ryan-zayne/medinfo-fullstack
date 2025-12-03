"use client";

import { getQueryClient } from "@/lib/react-query/queryClient";
import { sessionQuery } from "@/lib/react-query/queryOptions";
import { ProgressProvider } from "@bprogress/next/app";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HydrationBoundary } from "./HydrationBoundary";

type ProvidersProps = {
	children: React.ReactNode;
};

function Providers(props: ProvidersProps) {
	const { children } = props;

	const queryClient = getQueryClient();

	return (
		<HydrationBoundary
			queryClient={queryClient}
			onPrefetch={(client) => {
				void client.prefetchQuery(sessionQuery());
			}}
		>
			<ProgressProvider
				height="2.5px"
				color="hsl(150,21%,17%)"
				options={{ showSpinner: true }}
				shallowRouting={true}
			>
				{children}
			</ProgressProvider>

			<ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
		</HydrationBoundary>
	);
}

export { Providers };
