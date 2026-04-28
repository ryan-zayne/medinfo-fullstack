"use client";

import type { InferProps, PolymorphicProps } from "@zayne-labs/toolkit-react/utils";
import type { Prettify } from "@zayne-labs/toolkit-type-helpers";
import { tv, type VariantProps } from "tailwind-variants";
import { Slot } from "@/components/common/slot";
import { cnJoin } from "@/lib/utils/cn";
import { WhiteSpinnerIcon } from "../icons";

export type ButtonProps = InferProps<"button">
	& Prettify<
		VariantProps<typeof buttonVariants> & {
			asChild?: boolean;
			isLoading?: boolean;
			loadingStyle?: "replace-content" | "side-by-side";
			unstyled?: boolean;
		}
	>;

// eslint-disable-next-line react-refresh/only-export-components
export const buttonVariants = tv({
	base: "flex items-center justify-center gap-2 rounded-[8px]",

	compoundVariants: [
		{
			className: "grid justify-items-center",
			isLoading: true,
			loadingStyle: "replace-content",
		},
		{
			className: "gap-1.5",
			isLoading: true,
			loadingStyle: "side-by-side",
		},
		{
			className: "hover:rounded-[16px]",
			size: "medium",
			withInteractions: true,
		},
		{
			className: "hover:bg-medinfo-primary-darker active:bg-medinfo-primary-lighter",
			isDisabled: false,
			theme: "primary",
			withInteractions: true,
		},
		{
			className: `hover:border-medinfo-primary-darker active:border-medinfo-primary-lighter
			active:text-medinfo-primary-lighter`,
			isDisabled: false,
			theme: "primary-ghost",
			withInteractions: true,
		},
		{
			className: "hover:rounded-[50%] hover:shadow-none",
			size: "icon",
			withInteractions: true,
		},
		{
			className: "border-2 border-medinfo-dark-4 bg-medinfo-disabled-fill text-medinfo-dark-4",
			isDisabled: true,
			isLoading: false,
		},
	],

	defaultVariants: {
		size: "medium",
		theme: "primary",
	},

	variants: {
		disabled: {
			true: "cursor-not-allowed opacity-60",
		},

		isDisabled: {
			true: `cursor-not-allowed border-2 border-medinfo-dark-4 bg-medinfo-disabled-fill
			text-medinfo-dark-4`,
		},

		isLoading: {
			true: "",
		},

		loadingStyle: {
			"replace-content": "",
			"side-by-side": "",
		},

		size: {
			"full-width": "h-12 w-full px-6 text-base md:h-[64px] md:text-[18px] md:font-medium",

			icon: "size-12 md:size-16",

			large: "h-12 w-full px-6 text-base md:text-[18px] md:font-medium",

			medium: "h-12 px-6 text-base md:h-[64px] md:px-8 md:text-[18px] md:font-medium",
		},

		theme: {
			primary: "bg-medinfo-primary-main text-white",

			"primary-ghost": "border-2 border-medinfo-primary-main bg-white text-medinfo-primary-main",

			"secondary-ghost":
				"border-2 border-medinfo-secondary-lighter bg-transparent text-medinfo-secondary-lighter",
		},

		withInteractions: {
			true: `transition-[border-radius,box-shadow] duration-350 ease-[ease]
			hover:shadow-[0_4px_4px_0_hsl(0,0%,0%,0.12)]`,
		},
	},
});

function Button<TElement extends React.ElementType>(props: PolymorphicProps<TElement, ButtonProps>) {
	const {
		as: Element = "button",
		asChild,
		children,
		className,
		isDisabled = false,
		disabled = isDisabled,
		isLoading = false,
		loadingStyle = "replace-content",
		size,
		theme,
		type = "button",
		unstyled,
		withInteractions = true,
		...restOfProps
	} = props;

	const Component = asChild ? Slot.Root : Element;

	const BTN_CLASSES =
		!unstyled ?
			buttonVariants({
				className,
				disabled,
				isDisabled,
				isLoading,
				loadingStyle,
				size,
				theme,
				withInteractions,
			})
		:	className;

	const withIcon = (
		<>
			<Slot.Slottable>
				{loadingStyle === "replace-content" ?
					<div className="invisible [grid-area:1/1]">{children}</div>
				:	children}
			</Slot.Slottable>

			<span className={cnJoin(loadingStyle === "replace-content" && "[grid-area:1/1]")}>
				<WhiteSpinnerIcon />
			</span>
		</>
	);

	// == This technique helps prevents content shift when replacing children with spinner icon
	return (
		<Component type={type} className={BTN_CLASSES} disabled={disabled || isDisabled} {...restOfProps}>
			{isLoading ? withIcon : children}
		</Component>
	);
}

export { Button };
