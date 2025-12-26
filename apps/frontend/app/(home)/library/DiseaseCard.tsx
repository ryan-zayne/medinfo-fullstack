"use client";

import type { backendApiSchemaRoutes } from "@medinfo/shared/validation/backendApiSchema";
import { useDragScroll } from "@zayne-labs/ui-react/ui/drag-scroll";
import Image from "next/image";
import type { z } from "zod";
import { IconBox, NavLink } from "@/components/common";
import { getElementList } from "@/components/common/for";
import { Button, Card } from "@/components/ui";
import { cnJoin } from "@/lib/utils/cn";
import { tipPlaceHolder } from "@/public/assets/images/landing-page";

type DiseaseResponseType = z.infer<
	(typeof backendApiSchemaRoutes)["@get/diseases/all"]["data"]
>["data"]["diseases"][number];

export type DiseaseCardProps = {
	disease: DiseaseResponseType;
	type: "grid" | "list";
};

export function DiseaseCard(props: DiseaseCardProps) {
	const { disease, type } = props;

	return (
		<Card.Root
			as="li"
			className={cnJoin(
				"border-none shadow-none",
				type === "grid" && "relative h-full w-fit max-lg:max-h-[176px]",
				type === "list"
					&& "flex w-full gap-[44px] rounded-[16px] border-2 border-medinfo-primary-main p-6"
			)}
		>
			<Card.Header>
				<Image
					className={cnJoin(
						"object-cover",
						type === "grid"
							&& "h-[176px] rounded-[7px] lg:h-[400px] lg:max-w-[368px] lg:rounded-[16px]",
						type === "list" && "size-[68px] rounded-[4px] lg:size-[202px] lg:rounded-[12px]"
					)}
					src={disease.image}
					alt={disease.name}
					priority={true}
					width={type === "grid" ? 161 : 68}
					height={type === "grid" ? 176 : 68}
				/>
			</Card.Header>

			<Card.Content
				className={cnJoin(
					"flex flex-col justify-between",
					type === "grid"
						&& `absolute right-0 -bottom-[calc(95px/2)] h-[95px] max-w-fit rounded-[16px] border-2
						border-medinfo-primary-main bg-white p-2 lg:-right-[calc(3/5*229px)]
						lg:bottom-[calc((400px-182px)/2)] lg:h-[182px] lg:max-w-[229px] lg:p-6`
				)}
			>
				<div>
					<h4
						className={cnJoin(
							"text-[18px] text-medinfo-primary-main",
							type === "grid" && "font-medium lg:text-[22px]",
							type === "list" && "lg:text-[32px] lg:font-bold"
						)}
					>
						{disease.name}
					</h4>

					{type === "list" && (
						<p className="mt-[16px] hidden text-sm text-medinfo-dark-1 lg:block">
							{disease.description}
						</p>
					)}
				</div>

				{type === "grid" && (
					<p className="hidden text-sm text-medinfo-dark-1 lg:block">
						{disease.description.slice(0, 40)}...
					</p>
				)}

				<NavLink
					href={`/library/disease/${disease.name}`}
					className="inline-flex w-fit items-center gap-[14px] text-medinfo-primary-main lg:gap-4
						lg:text-[20px] lg:font-medium"
				>
					See more
					<IconBox icon="lucide:chevron-right" className="size-5 lg:size-6" />
				</NavLink>
			</Card.Content>
		</Card.Root>
	);
}

type AlternateDiseaseCardProps =
	| {
			className?: string;
			disease: DiseaseResponseType;
			linkToAd?: null;
			type: "grid";
	  }
	| {
			className?: string;
			disease?: null;
			linkToAd: string;
			type: "list";
	  };

export function AlternateDiseaseCard(props: AlternateDiseaseCardProps) {
	const { className, disease, linkToAd, type } = props;

	return (
		<Card.Root
			as="li"
			data-type={type}
			className={cnJoin(
				type === "grid" && "max-w-[161px] shrink-0 lg:max-w-[340px]",
				type === "list"
					&& `w-fit flex-row gap-4 rounded-[16px] bg-medinfo-secondary-subtle p-3
					shadow-[0_4px_4px_hsl(0,0%,0%,0.12)] lg:p-6`,
				className
			)}
		>
			<Card.Header className={cnJoin(type === "list" && "items-center")}>
				<Image
					className={cnJoin(
						"object-cover",
						type === "grid" && "h-[132px] rounded-[7.5px] lg:h-[280px] lg:rounded-[16px]",
						type === "list" && "size-[92px] rounded-[6px] lg:size-[120px] lg:rounded-[8px]"
					)}
					src={type === "grid" ? disease.image : (tipPlaceHolder as string)}
					alt=""
					priority={true}
					width={type === "grid" ? 161 : 92}
					height={type === "grid" ? 132 : 92}
				/>
			</Card.Header>

			<Card.Content
				className={cnJoin(
					"flex h-full flex-col justify-between",
					type === "list" && "max-w-[300px] gap-1 md:max-w-[552px]",
					type === "grid" && "mt-5 gap-2 rounded-[16px] lg:gap-4"
				)}
			>
				<div className="flex justify-between">
					<h4
						className={cnJoin(
							"text-[18px] font-medium",
							type === "list" && "text-medinfo-body-color lg:text-[22px]",
							type === "grid" && "text-medinfo-dark-1 lg:text-[32px] lg:font-semibold"
						)}
					>
						{type === "grid" ? disease.name : "Potential Advertisement"}
					</h4>

					{type === "list" && (
						<Button unstyled={true} className="active:scale-[1.02]">
							<IconBox icon="radix-icons:cross-circled" className="size-5" />
						</Button>
					)}
				</div>

				<p
					className={cnJoin(
						"text-xs",
						type === "list" && "text-medinfo-dark-1 lg:text-base lg:leading-6",
						type === "grid" && "text-medinfo-body-color lg:text-[18px] lg:leading-[26px]"
					)}
				>
					{type === "grid" ?
						`${disease.description.slice(0, 40)}...`
					:	"Lorem ipsum dolor sit amet consectetur. Et a diam adipiscing."}
				</p>

				{type === "list" && (
					<a href={linkToAd} className="w-fit">
						<IconBox icon="akar-icons:link-out" className="size-5 lg:size-6" />
					</a>
				)}

				{type === "grid" && (
					<NavLink
						href={`/library/disease/${disease.name}`}
						className="inline-flex w-fit items-center gap-3.5 text-medinfo-primary-main lg:gap-4
							lg:text-[20px]"
					>
						Read post
						<IconBox icon="lucide:chevron-right" className="size-5 lg:size-6" />
					</NavLink>
				)}
			</Card.Content>
		</Card.Root>
	);
}

export type ScrollableAlternateDiseaseCardsProps = {
	diseases: DiseaseResponseType[];
};

export function ScrollableAlternateDiseaseCards(props: ScrollableAlternateDiseaseCardsProps) {
	const { diseases } = props;

	const { getItemProps, getRootProps } = useDragScroll<HTMLUListElement>({
		classNames: {
			base: "flex justify-between gap-5 lg:mt-10",
		},
	});

	const [CardList] = getElementList();

	return (
		<CardList
			{...getRootProps()}
			each={diseases}
			renderItem={(disease, index) => (
				<AlternateDiseaseCard key={index} type="grid" disease={disease} {...getItemProps()} />
			)}
		/>
	);
}
