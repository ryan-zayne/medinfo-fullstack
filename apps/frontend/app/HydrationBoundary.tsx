import {
	dehydrate,
	HydrationBoundary as HydrationBoundaryPrimitive,
	QueryClient,
	type queryOptions,
} from "@tanstack/react-query";
import { isArray, type Awaitable } from "@zayne-labs/toolkit-type-helpers";
import { getQueryClient } from "@/lib/react-query/queryClient";

type HydrationBoundaryProps = {
	children: React.ReactNode;
	onPrefetch?: (client: QueryClient) => Array<Promise<void>> | Awaitable<void>;
	// eslint-disable-next-line ts-eslint/no-explicit-any
	queries?: Array<ReturnType<typeof queryOptions<any, Error, unknown, string[]>>>;
	queryClient?: QueryClient;
};

export async function HydrationBoundaryWithAwait(props: HydrationBoundaryProps) {
	const { children, onPrefetch, queries, queryClient: queryClientProp } = props;

	const queryClient = queryClientProp ?? getQueryClient();

	const promiseOrPromiseArray =
		onPrefetch?.(queryClient) ?? queries?.map((query) => queryClient.prefetchQuery(query));

	await (isArray(promiseOrPromiseArray) ? Promise.all(promiseOrPromiseArray) : promiseOrPromiseArray);

	const state = dehydrate(queryClient);

	return <HydrationBoundaryPrimitive state={state}>{children}</HydrationBoundaryPrimitive>;
}

export function HydrationBoundary(props: HydrationBoundaryProps) {
	const { children, onPrefetch, queries, queryClient: queryClientProp } = props;

	const queryClient = queryClientProp ?? getQueryClient();

	const promiseOrPromiseArray =
		onPrefetch?.(queryClient) ?? queries?.map((query) => queryClient.prefetchQuery(query));

	void (isArray(promiseOrPromiseArray) ? Promise.all(promiseOrPromiseArray) : promiseOrPromiseArray);

	const state = dehydrate(queryClient);

	return <HydrationBoundaryPrimitive state={state}>{children}</HydrationBoundaryPrimitive>;
}
