import { useId } from "react";
import { cnMerge } from "@/lib/utils/cn";

type OverlayProps = {
	className?: string;
	isOpen: boolean;
	onClose: () => void;
};

function Overlay(props: OverlayProps) {
	const { className, isOpen, onClose } = props;

	const id = useId();

	return (
		<div
			id={`Overlay-(${id})`}
			onClick={onClose}
			className={cnMerge(
				"fixed [inset:0_0_0_auto] bg-[hsl(0,0%,0%,0.6)] [backdrop-filter:blur(0.4rem)] lg:hidden",
				isOpen ? "w-screen" : "w-0",
				className
			)}
		/>
	);
}

export { Overlay };
