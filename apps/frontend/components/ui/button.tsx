"use client";

import { Slot } from "@/components/common/slot";
import type { InferProps, PolymorphicProps } from "@zayne-labs/toolkit-react/utils";
import type { Prettify } from "@zayne-labs/toolkit-type-helpers";
import { tv, type VariantProps } from "tailwind-variants";
import { WhiteSpinnerIcon } from "../icons";

export type ButtonProps = InferProps<"button">
	& Prettify<
		VariantProps<typeof buttonVariants> & {
			asChild?: boolean;
			isLoading?: boolean;
			unstyled?: boolean;
		}
	>;

// eslint-disable-next-line react-refresh/only-export-components
export const buttonVariants = tv({
	base: "flex items-center justify-center rounded-[8px]",

	compoundVariants: [
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
			theme: "secondary",
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
			true: "cursor-not-allowed",
		},

		isDisabled: {
			true: `cursor-not-allowed border-2 border-medinfo-dark-4 bg-medinfo-disabled-fill
			text-medinfo-dark-4`,
		},

		isLoading: {
			true: "grid",
		},

		size: {
			"full-width": "h-[48px] w-full text-base md:h-[64px] md:text-[20px] md:font-medium",

			icon: "size-12 md:size-16",

			large: "h-[48px] w-full text-base md:text-[20px] md:font-medium",

			medium: `h-[48px] w-fit min-w-[105px] text-base md:h-[64px] md:min-w-[135px] md:text-[20px]
			md:font-medium`,
		},

		theme: {
			primary: "bg-medinfo-primary-main text-white",

			"primary-inverted": "bg-white text-medinfo-primary-main",

			secondary: "border-2 border-medinfo-primary-main bg-transparent text-medinfo-primary-main",

			"secondary-inverted": "border-2 border-white bg-transparent text-white",
		},

		withInteractions: {
			true: "[transition:border-radius_350ms_ease] hover:shadow-[0_4px_4px_0_hsl(0,0%,0%,0.12)]",
		},
	},
});

function Button<TElement extends React.ElementType>(props: PolymorphicProps<TElement, ButtonProps>) {
	const {
		as: Element = "button",
		asChild,
		children,
		className,
		disabled = false,
		isDisabled = disabled,
		isLoading = false,
		size,
		theme,
		type = "button",
		unstyled,
		withInteractions = true,
		...extraButtonProps
	} = props;

	const Component = asChild ? Slot.Root : Element;

	const BTN_CLASSES =
		!unstyled ?
			buttonVariants({
				className,
				disabled,
				isDisabled,
				isLoading,
				size,
				theme,
				withInteractions,
			})
		:	className;

	const withIcon = (
		<>
			<Slot.Slottable>
				<div className="invisible [grid-area:1]">{children}</div>
			</Slot.Slottable>

			<span className="flex justify-center [grid-area:1]">
				<WhiteSpinnerIcon />
			</span>
		</>
	);

	// == This technique helps prevents content shift when replacing children with spinner icon
	return (
		<Component
			type={type}
			className={BTN_CLASSES}
			disabled={disabled || isDisabled}
			{...extraButtonProps}
		>
			{isLoading ? withIcon : children}
		</Component>
	);
}

export { Button };
