"use client";

import Image from "next/image";
import { ForWithWrapper } from "@/components/common/for";
import { Card } from "@/components/ui";
import { cnMerge } from "@/lib/utils/cn";
import { Main } from "../../-components/Main";

const activityLogs = [
	{ id: 1, title: "Children's health" },
	{ id: 2, title: "Children's car" },
	{ id: 3, title: "Children's car" },
	{ id: 4, title: "Children's car" },
	{ id: 5, title: "Children's car" },
	{ id: 6, title: "Children's car" },
	{ id: 7, title: "Children's car" },
];

const cardData = [
	{ id: 1, price: "$0 - $120", slug: "Primary care appointment" },
	{ id: 2, price: "$0 - $120", slug: "Primary care appointment" },
	{ id: 3, price: "$0 - $120", slug: "Primary care appointment" },
	{ id: 4, price: "$0 - $120", slug: "Primary care appointment" },
	{ id: 5, price: "$0 - $120", slug: "Primary care appointment" },
	{ id: 6, price: "$0 - $120", slug: "Primary care appointment" },
];

function PatientDashboardPage() {
	return (
		<Main className="gap-6">
			<section className="flex w-full flex-col gap-10 lg:flex-row">
				<article className="w-full rounded-[16px] bg-white p-6 shadow-md lg:p-7">
					<header className="flex items-center justify-between">
						<h2 className="text-[22px] font-medium text-medinfo-primary-main lg:text-[24px]">
							Overall activity
						</h2>
						<div>
							<p className="font-normal text-medinfo-dark-2">2023</p>
						</div>
					</header>
					<div>{/* <Image src={ChartImage} height={} alt="chart"/> */}</div>
				</article>

				<article className="w-full rounded-[16px] bg-white p-6 shadow-md lg:max-w-[338px] lg:p-7">
					<h2 className="text-[22px] font-medium text-medinfo-primary-main lg:text-[24px]">
						Activities
					</h2>

					<div className="mt-3 rounded-[8px] border border-medinfo-secondary-main">
						<div
							className="flex gap-8 rounded-t-[8px] bg-medinfo-secondary-main py-2 pl-2
								font-semibold text-medinfo-dark-1"
						>
							<p>S/N</p>
							<p>Log</p>
						</div>

						<ForWithWrapper
							className="flex max-h-[296px] flex-col overflow-y-hidden pl-2"
							each={activityLogs}
							renderItem={(log, index) => (
								<li key={log.id} className="flex gap-8 font-normal">
									<span className="size-[29px]">{index + 1}</span>
									<span>{log.title}</span>
								</li>
							)}
						/>
					</div>
				</article>
			</section>

			<section className="w-full rounded-[16px] bg-white p-6 shadow-md lg:p-8">
				<ForWithWrapper
					className="grid grid-cols-1 gap-10 lg:grid-cols-2"
					each={cardData}
					renderItem={(card) => (
						<Card.Root
							as="li"
							key={card.id}
							className={cnMerge(
								`flex cursor-pointer items-start gap-3 rounded-[16px] border
								border-medinfo-secondary-main p-4 transition-shadow hover:shadow-md`,
								"lg:gap-4 lg:p-7"
							)}
						>
							<Card.Header className="size-16">
								<Image
									src="/assets/images/dashboard/Frame 2609432.png"
									width={64}
									height={64}
									alt="product"
								/>
							</Card.Header>
							<Card.Content className="flex-1 space-y-2">
								<Card.Title
									className="text-[18px] font-medium text-medinfo-primary-main lg:text-[20px]"
								>
									{card.slug}
								</Card.Title>
								<Card.Description className="text-[14px] text-medinfo-dark-2 lg:text-[16px]">
									Lorem ipsum dolor sit amet consectetur. Massa nec imperdiet neque ut.
								</Card.Description>
								<p className="text-[14px] font-semibold text-medinfo-dark-1">{card.price}</p>
							</Card.Content>
						</Card.Root>
					)}
				/>
			</section>
		</Main>
	);
}

export default PatientDashboardPage;
