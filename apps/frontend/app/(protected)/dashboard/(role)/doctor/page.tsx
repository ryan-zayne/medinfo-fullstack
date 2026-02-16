"use client";

import { ForWithWrapper } from "@/components/common";
import CalendarIcon from "@/components/icons/CalendarIcon";
import DollarSignIcon from "@/components/icons/DollarSignIcon";
import NextIcon from "@/components/icons/NextIcon";
import PatientIcon from "@/components/icons/PatientIcon";
import { cnJoin } from "@/lib/utils/cn";
import { Main } from "../../-components/Main";

const statsArray = [
	{
		bgColor: "bg-[#f0fdf6]",
		icon: <DollarSignIcon />,
		id: 1,
		title: "Net income",
		value: "$ 1200",
	},
	{
		bgColor: "bg-[#eff4fb]",
		icon: <PatientIcon />,
		id: 2,
		title: "Number of patients",
		value: "890",
	},
	{
		bgColor: "bg-[#F8F5DB]",
		icon: <CalendarIcon width={44} height={44} />,
		id: 3,
		title: "Total appointments",
		value: "65",
	},
];

const appointmentsArray = [
	{
		id: 1,
		patientName: "Alex.O",
		patientType: "Men's health",
		time: "09:00",
	},
	{
		id: 2,
		patientName: "Alex.O",
		patientType: "Men's health",
		time: "09:00",
	},
	{
		id: 3,
		patientName: "Alex.O",
		patientType: "Men's health",
		time: "09:00",
	},
	{
		id: 4,
		patientName: "Alex.O",
		patientType: "Men's health",
		time: "09:00",
	},
];

const appointmentRequestsArray = [
	{
		id: 1,
		patientName: "Alex.O",
		patientType: "Men's health",
		time: "09:00",
	},
	{
		id: 2,
		patientName: "Alex.O",
		patientType: "Men's health",
		time: "09:00",
	},
	{
		id: 3,
		patientName: "Alex.O",
		patientType: "Men's health",
		time: "09:00",
	},
	{
		id: 4,
		patientName: "Alex.O",
		patientType: "Men's health",
		time: "09:00",
	},
];

function DoctorPage() {
	return (
		<Main className="gap-10 lg:flex-row">
			<section className="w-full rounded-[16px] bg-white p-6 shadow-md lg:p-7">
				<header className="flex items-center justify-between">
					<h2 className="text-[22px] font-medium text-medinfo-primary-main lg:text-[24px]">
						Overall activity
					</h2>
					<p className="font-normal text-medinfo-dark-2">2023</p>
				</header>

				<ForWithWrapper
					className="grid grid-cols-1 gap-6 lg:grid-cols-3"
					each={statsArray}
					renderItem={(stat) => (
						<li
							key={stat.id}
							className="flex cursor-pointer items-start gap-3 rounded-[16px] border
								border-medinfo-secondary-main p-4 transition-shadow hover:shadow-md lg:gap-4
								lg:p-7"
						>
							<span className={cnJoin("inline-block size-[64px] rounded-[8px] p-2", stat.bgColor)}>
								{stat.icon}
							</span>

							<span className="flex flex-col gap-2">
								<h3 className="text-[18px] font-medium lg:text-[20px]">{stat.title}</h3>
								<p className="text-[14px] font-semibold text-medinfo-dark-1">{stat.value}</p>
							</span>
						</li>
					)}
				/>
			</section>

			<section
				className="flex w-full flex-col gap-10 rounded-[16px] bg-white p-6 shadow-md lg:flex-row
					lg:p-8"
			>
				<article className="flex flex-col gap-6">
					<header className="flex flex-col items-start lg:flex-row lg:items-center lg:justify-between">
						<h2 className="text-[18px] font-medium lg:text-[22px]">Today's appointment</h2>
						<p className="text-[14px] font-normal">18th February, 2023</p>
					</header>

					<span className="mt-3 flex items-center gap-4">
						<p className="font-medium lg:text-[20px]">See all</p>
						<NextIcon />
					</span>

					<ForWithWrapper
						className="mt-6 flex flex-col gap-3"
						each={appointmentsArray}
						renderItem={(appointment) => (
							<li
								key={appointment.id}
								className="flex w-full justify-between rounded-[8px] border
									border-medinfo-secondary-main px-5 py-4"
							>
								<div className="flex gap-3">
									<span className="size-14 shrink-0 rounded-full bg-gray-500" />

									<div className="flex flex-col gap-3">
										<h4 className="text-[18px] font-semibold text-medinfo-primary-darker">
											{appointment.patientName}
										</h4>
										<p className="text-[14px] font-normal">{appointment.patientType}</p>
									</div>
								</div>

								<p>{appointment.time}</p>
							</li>
						)}
					/>
				</article>

				<article className="flex flex-col gap-6">
					<header className="flex items-center justify-between">
						<h2 className="text-[18px] font-medium lg:text-[22px]">Appointment requests</h2>
					</header>

					<span className="mt-3 flex items-center gap-4">
						<p className="font-medium lg:text-[20px]">See all</p>
						<NextIcon />
					</span>

					<ForWithWrapper
						className="mt-6 flex flex-col gap-3"
						each={appointmentRequestsArray}
						renderItem={(request) => (
							<li
								key={request.id}
								className="flex w-full justify-between rounded-[8px] border
									border-medinfo-secondary-main px-5 py-4"
							>
								<span className="flex gap-3">
									<span className="size-14 shrink-0 rounded-full bg-gray-500" />
									<span className="space-y-3">
										<h4 className="text-[18px] font-semibold text-medinfo-primary-darker">
											{request.patientName}
										</h4>
										<p className="text-[14px] font-normal">{request.patientType}</p>
									</span>
								</span>
								<span>{request.time}</span>
							</li>
						)}
					/>
				</article>
			</section>
		</Main>
	);
}

export default DoctorPage;
