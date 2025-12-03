import { cnMerge } from "@/lib/utils/cn";

function Main(props: React.ComponentPropsWithoutRef<"main">) {
	const { children, className, ...restOfProps } = props;

	return (
		<main
			className={cnMerge("flex grow flex-col px-6 py-14 md:px-[100px] md:py-[92px]", className)}
			{...restOfProps}
		>
			{children}
		</main>
	);
}

export default Main;
