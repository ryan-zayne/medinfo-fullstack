"use client";

import { ForWithWrapper, IconBox } from "@/components/common";
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
		date: "19th February, 2023",
		id: 1,
		patientName: "Alex.O",
		patientType: "Men's health",
		time: "09:00",
	},
	{
		date: "19th February, 2023",
		id: 2,
		patientName: "Mary.A",
		patientType: "Sexual health",
		time: "09:00",
	},
	{
		date: "19th February, 2023",
		id: 3,
		patientName: "Alex.O",
		patientType: "Men's health",
		time: "09:00",
	},
	{
		date: "19th February, 2023",
		id: 4,
		patientName: "Mary.A",
		patientType: "Sexual health",
		time: "09:00",
	},
];

function DoctorPage() {
	return (
		<Main className="gap-6">
			<section className="flex w-full flex-col gap-6 lg:flex-row">
				<ForWithWrapper
					className="flex flex-col gap-6"
					each={statsArray}
					renderItem={(stat) => (
						<li
							key={stat.id}
							className="flex cursor-pointer items-start gap-3 rounded-[16px] border
								border-medinfo-secondary-main bg-white p-4 shadow-sm transition-shadow
								hover:shadow-md lg:gap-4 lg:p-7"
						>
							<div className={cnJoin("size-16 rounded-[8px] p-2", stat.bgColor)}>{stat.icon}</div>
							<div className="flex-1 space-y-2">
								<h3 className="text-[18px] font-medium lg:text-[20px]">{stat.title}</h3>
								<p className="text-[14px] font-semibold text-medinfo-dark-1">{stat.value}</p>
							</div>
						</li>
					)}
				/>

				<article className="flex grow flex-col gap-6 rounded-[16px] bg-white p-6 shadow-md lg:p-7">
					<header className="flex items-center justify-between">
						<h2 className="text-[22px] font-medium text-medinfo-primary-main lg:text-[24px]">
							Overall activity
						</h2>
						<p className="font-normal text-medinfo-dark-2">2023</p>
					</header>

					<div className="flex min-h-[300px] items-center justify-center rounded-lg bg-gray-50">
						<p className="text-medinfo-dark-3">Graph component will go here</p>
					</div>
				</article>
			</section>

			<section
				className="flex w-full flex-col gap-6 rounded-[16px] bg-white p-6 shadow-md lg:flex-row lg:p-8"
			>
				<article className="flex flex-1 flex-col gap-6">
					<header className="flex flex-col items-start lg:flex-row lg:items-center lg:justify-between">
						<h2 className="text-[18px] font-medium lg:text-[22px]">Today's appointment</h2>
						<p className="text-[14px] font-normal">18th February, 2023</p>
					</header>

					<div className="mt-3 flex items-center gap-4">
						<p className="font-medium lg:text-[20px]">See all</p>
						<NextIcon />
					</div>

					<ForWithWrapper
						className="flex flex-col gap-3"
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

								<span>{appointment.time}</span>
							</li>
						)}
					/>
				</article>

				<article className="flex flex-1 flex-col gap-6">
					<header className="flex items-center justify-between">
						<h2 className="text-[18px] font-medium lg:text-[22px]">Appointment requests</h2>
					</header>
					<div className="mt-3 flex items-center gap-4">
						<p className="font-medium lg:text-[20px]">See all</p>
						<NextIcon />
					</div>

					<ForWithWrapper
						className="flex flex-col gap-3"
						each={appointmentRequestsArray}
						renderItem={(request) => (
							<li
								key={request.id}
								className="flex w-full justify-between rounded-[8px] border
									border-medinfo-secondary-main px-5 py-4"
							>
								<div className="flex gap-3">
									<span className="size-14 shrink-0 rounded-full bg-gray-500" />

									<div className="flex flex-col gap-1">
										<h4 className="text-[16px] font-semibold text-medinfo-primary-darker">
											{request.patientName}
										</h4>
										<p className="text-[14px] font-normal text-medinfo-dark-3">
											{request.patientType}
										</p>
										<p className="text-[12px] font-normal text-medinfo-dark-3">
											{request.date} - {request.time}
										</p>
									</div>
								</div>

								<div className="flex gap-4">
									<IconBox
										icon="feather:x-circle"
										className="size-6.5 text-medinfo-state-error-darker"
									/>

									<IconBox
										icon="material-symbols:check-circle-outline-rounded"
										className="size-6.5 text-medinfo-state-success-darker"
									/>
								</div>
							</li>
						)}
					/>
				</article>
			</section>
		</Main>
	);
}

export default DoctorPage;
