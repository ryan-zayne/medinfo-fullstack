"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

function Page() {
	const router = useRouter();

	const handleNavigation = (slug: string) => {
		router.push(`/patient/${slug}`);
	};

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

	const renderActivityLogs = () =>
		activityLogs.map((log, index) => (
			<div key={log.id} className="flex gap-[34px] font-normal">
				<h2 className="size-[29px]">{index + 1}</h2>
				<h2>{log.title}</h2>
			</div>
		));

	const renderCards = () =>
		cardData.map((card) => (
			<div
				key={card.id}
				className="flex items-start gap-[12px] rounded-[8px] border border-solid
					border-medinfo-secondary-main p-[16px] lg:px-[27px] lg:py-[28px]"
				onClick={() => handleNavigation(card.slug)}
			>
				<div className="size-[64px]">
					<Image
						src="/assets/images/dashboard/Frame 2609432.png"
						width={64}
						height={64}
						alt="product"
					/>
				</div>
				<div className="flex-1 space-y-[8px]">
					<h2 className="text-[18px] font-medium lg:text-[20px]">{card.slug}</h2>
					<p className="text-[14px] text-medinfo-dark-2 lg:text-[16px]">
						Lorem ipsum dolor sit amet consectetur. Massa nec imperdiet neque ut.
					</p>
					<p className="text-[14px] font-semibold text-medinfo-dark-1">{card.price}</p>
				</div>
			</div>
		));

	return (
		<div className="p-[24px] lg:p-[40px]">
			<div className="flex max-h-[402px] w-full flex-col gap-[40px] lg:flex-row">
				<div className="w-full rounded-[16px] bg-white p-[16px] shadow-md lg:p-[28px]">
					<div className="flex items-center justify-between">
						<h2 className="text-[22px] font-medium">Overall activity</h2>
						<div>
							<p className="font-normal">2023</p>
						</div>
					</div>
					<div>{/* <Image src={ChartImage} height={} alt="chart"/> */}</div>
				</div>
				<div className="w-full rounded-[16px] bg-white p-[16px] shadow-md lg:max-w-[338px] lg:p-[28px]">
					<h2 className="text-[22px] font-medium text-medinfo-dark-1">Activities</h2>
					<div className="mt-[12px] rounded-[8px] border border-solid border-medinfo-secondary-main">
						<div
							className="flex gap-[34px] rounded-t-[8px] bg-medinfo-secondary-main py-[8px] pl-[8px]
								font-semibold text-medinfo-dark-1"
						>
							<h2>S/N</h2>
							<h2>Log</h2>
						</div>
						<div className="h-auto max-h-[296px] overflow-y-hidden pl-[8px]">
							<div className="flex flex-col">{renderActivityLogs()}</div>
						</div>
					</div>
				</div>
			</div>
			<div className="mt-[32px] w-full rounded-[16px] bg-white p-[16px] shadow-md lg:p-[32px]">
				<div className="grid grid-cols-1 gap-[40px] lg:grid-cols-2">{renderCards()}</div>
			</div>
		</div>
	);
}

export default Page;
