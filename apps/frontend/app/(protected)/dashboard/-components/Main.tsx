import { cnMerge } from "@/lib/utils/cn";
import type { InferProps } from "@zayne-labs/toolkit-react/utils";

function Main(props: InferProps<"main">) {
	const { children, className, ...restOfProps } = props;

	return (
		<main
			className={cnMerge("flex grow flex-col px-6 py-14 md:px-10 md:pt-10 md:pb-[92px]", className)}
			{...restOfProps}
		>
			{children}
		</main>
	);
}

export { Main };
