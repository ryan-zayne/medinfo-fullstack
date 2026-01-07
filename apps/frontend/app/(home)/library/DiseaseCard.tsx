"use client";

import type { backendApiSchemaRoutes } from "@medinfo/shared/validation/backendApiSchema";
import Image from "next/image";
import type { z } from "zod";
import { IconBox, NavLink } from "@/components/common";
import { For } from "@/components/common/for";
import { Button, Card, Carousel, Skeleton } from "@/components/ui";
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
				type === "grid" && "relative h-full w-fit max-lg:max-h-[176px]",
				type === "list"
					&& "w-full flex-row gap-[44px] rounded-[16px] border-2 border-medinfo-primary-main p-6"
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
				<div className={cnJoin(type === "list" && "flex flex-col gap-4")}>
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
						<p className="hidden text-sm text-medinfo-dark-1 lg:block">{disease.description}</p>
					)}
				</div>

				{type === "grid" && (
					<p className="hidden text-sm text-medinfo-dark-1 lg:block">
						{disease.description.slice(0, 40)}...
					</p>
				)}

				<NavLink
					href={`/library/disease/${disease.name}`}
					className="inline-flex w-fit items-center gap-3.5 text-medinfo-primary-main lg:gap-4
						lg:text-[20px] lg:font-medium"
				>
					See more
					<IconBox icon="lucide:chevron-right" className="size-5 lg:size-6" />
				</NavLink>
			</Card.Content>
		</Card.Root>
	);
}

export type DiseaseCardSkeletonProps = {
	type: "grid" | "list";
};

export function DiseaseCardSkeleton(props: DiseaseCardSkeletonProps) {
	const { type } = props;

	return (
		<Card.Root
			as="li"
			className={cnJoin(
				type === "grid" && "relative h-full w-fit max-lg:max-h-[176px]",
				type === "list"
					&& `w-full flex-row gap-6 rounded-2xl border-2 border-medinfo-primary-main p-4 lg:gap-11
					lg:p-6`
			)}
		>
			<Card.Header className={cnJoin(type === "list" && "shrink-0")}>
				<Skeleton
					className={cnJoin(
						"bg-medinfo-light-1",
						type === "grid" && "h-44 w-full min-w-40 rounded-[7px] lg:h-100 lg:w-92 lg:rounded-2xl",
						type === "list" && "size-[68px] rounded-[4px] lg:size-[202px] lg:rounded-[12px]"
					)}
				/>
			</Card.Header>

			<Card.Content
				className={cnJoin(
					"flex flex-col justify-between",
					type === "grid"
						&& `absolute right-0 -bottom-[calc(95px/2)] h-[95px] min-w-[120px] rounded-2xl border-2
						border-medinfo-primary-main bg-white p-2 lg:-right-[calc(3/5*229px)]
						lg:bottom-[calc((400px-182px)/2)] lg:h-[182px] lg:max-w-[229px] lg:min-w-[200px] lg:p-6`,
					type === "list" && "grow gap-2 lg:gap-4"
				)}
			>
				<div className={cnJoin(type === "list" && "flex flex-col gap-2 lg:gap-3")}>
					<Skeleton
						className={cnJoin(
							"bg-medinfo-light-1",
							type === "grid" && "h-5 w-20 lg:h-7 lg:w-30",
							type === "list" && "h-5 w-28 lg:h-8 lg:w-48"
						)}
					/>

					{type === "list" && (
						<div className="flex flex-col gap-2">
							<Skeleton
								className="h-3 w-full max-w-[400px] bg-medinfo-light-1 lg:h-4 lg:max-w-[500px]"
							/>
							<Skeleton
								className="h-3 w-4/5 max-w-[320px] bg-medinfo-light-1 lg:h-4 lg:max-w-[400px]"
							/>
							<Skeleton className="hidden h-4 w-3/5 max-w-[300px] bg-medinfo-light-1 lg:block" />
						</div>
					)}
				</div>

				{type === "grid" && (
					<Skeleton className="hidden h-4 w-[100px] bg-medinfo-light-1 lg:block lg:w-[180px]" />
				)}

				<div className="flex items-center gap-3.5 lg:gap-4">
					<Skeleton className="h-4 w-[60px] bg-medinfo-light-1 lg:h-5 lg:w-[80px]" />
					<Skeleton className="size-5 rounded-full bg-medinfo-light-1 lg:size-6" />
				</div>
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

	return (
		<Carousel.Root className="w-full lg:mt-10">
			<Carousel.Content className="gap-5 select-none">
				<For
					each={diseases}
					renderItem={(disease) => (
						<Carousel.Item key={disease.name} className="w-fit cursor-grab active:cursor-grabbing">
							<AlternateDiseaseCard type="grid" disease={disease} />
						</Carousel.Item>
					)}
				/>
			</Carousel.Content>
		</Carousel.Root>
	);
}
