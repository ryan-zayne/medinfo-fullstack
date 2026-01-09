"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { getQueryClient } from "@/lib/react-query/queryClient";

type ProvidersProps = {
	children: React.ReactNode;
};

function Providers(props: ProvidersProps) {
	const { children } = props;

	const queryClient = getQueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<ProgressProvider
				height="2.5px"
				color="hsl(150,21%,17%)"
				options={{ showSpinner: true }}
				shallowRouting={true}
			>
				<NuqsAdapter>{children}</NuqsAdapter>
			</ProgressProvider>

			<ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
		</QueryClientProvider>
	);
}

export { Providers };
