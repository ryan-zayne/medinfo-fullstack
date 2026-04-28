"use client";

import type { backendApiSchemaRoutes } from "@medinfo/shared/validation/backendApiSchema";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { z } from "zod";
import { For } from "@/components/common/for";
import { IconBox } from "@/components/common/IconBox";
import { NavLink } from "@/components/common/NavLink";
import { Switch } from "@/components/common/switch";
import { Card, Carousel, Skeleton } from "@/components/ui";
import { healthTipsQuery } from "@/lib/react-query/queryOptions";
import { cnMerge } from "@/lib/utils/cn";

export type DailyTipCardProps = Omit<
	z.infer<(typeof backendApiSchemaRoutes)["@get/health-tips/one/:id"]["data"]>["data"],
	"lastUpdated" | "mainContent"
> & {
	className?: string;
};

export function DailyTipCard(props: DailyTipCardProps) {
	const { className, id, imageAlt, imageUrl, title } = props;

	return (
		<Card.Root
			as="li"
			className={cnMerge(
				`flex h-full w-[161px] shrink-0 flex-col rounded-[16px] border-[1.4px] border-medinfo-light-1
				pb-3 max-md:gap-3 md:w-[276px] md:pb-7`,
				className
			)}
		>
			<Card.Header className="h-[117px] md:h-[176px]">
				<Image
					className="h-full rounded-t-[16px] object-cover"
					src={imageUrl}
					alt={imageAlt}
					draggable={false}
					width={161}
					height={117}
				/>
			</Card.Header>

			<Card.Content className="grow px-3 md:p-7">{title}</Card.Content>

			<Card.Footer className="px-3 md:px-7" asChild={true}>
				<NavLink href={`/daily-tips/${id}`} className="flex items-center gap-2">
					Learn More
					<IconBox icon="lucide:chevron-right" className="text-[20px]" />
				</NavLink>
			</Card.Footer>
		</Card.Root>
	);
}

export function DailyTipCardSkeleton({ className }: { className?: string }) {
	return (
		<Card.Root
			className={cnMerge(
				`flex h-full min-h-[299px] w-[161px] shrink-0 flex-col rounded-[16px] border-[1.4px]
				border-medinfo-light-1 pb-3 max-md:gap-3 md:min-h-[358px] md:w-[276px] md:pb-7`,
				className
			)}
		>
			<Card.Header className="h-[117px] md:h-[176px]">
				<Skeleton className="size-full rounded-t-[16px] rounded-b-none bg-medinfo-light-1" />
			</Card.Header>

			<Card.Content className="flex grow flex-col gap-2 px-3 pt-3 md:p-7">
				<Skeleton className="h-4 w-full bg-medinfo-light-1" />
				<Skeleton className="h-4 w-2/3 bg-medinfo-light-1" />
			</Card.Content>

			<Card.Footer className="px-3 md:px-7">
				<Skeleton className="h-4 w-24 bg-medinfo-light-1" />
			</Card.Footer>
		</Card.Root>
	);
}

export function ScrollableTipCards(props: { tipId?: string }) {
	const { tipId } = props;

	const healthTipsQueryResult = useQuery(healthTipsQuery({ tipId }));

	return (
		<Carousel.Root className="mt-6 w-full">
			<Carousel.Content className="gap-5 select-none">
				<Switch.Root>
					<Switch.Match when={healthTipsQueryResult.isPending}>
						<For
							each={6}
							renderItem={(index) => (
								<Carousel.Item key={index} className="w-fit cursor-grab active:cursor-grabbing">
									<DailyTipCardSkeleton />
								</Carousel.Item>
							)}
						/>
					</Switch.Match>

					<Switch.Match when={healthTipsQueryResult.data?.data}>
						{(tips) => (
							<For
								each={tips}
								renderItem={(tip) => (
									<Carousel.Item
										key={tip.id}
										className="w-fit cursor-grab active:cursor-grabbing"
									>
										<DailyTipCard
											id={tip.id}
											imageUrl={tip.imageUrl}
											title={tip.title}
											imageAlt={tip.imageAlt}
										/>
									</Carousel.Item>
								)}
							/>
						)}
					</Switch.Match>
				</Switch.Root>
			</Carousel.Content>
		</Carousel.Root>
	);
}
