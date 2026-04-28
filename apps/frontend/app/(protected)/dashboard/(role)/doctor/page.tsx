"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ForWithWrapper } from "@/components/common/for";
import { IconBox } from "@/components/common/IconBox";
import { NavLink } from "@/components/common/NavLink";
import CalendarIcon from "@/components/icons/CalendarIcon";
import DollarSignIcon from "@/components/icons/DollarSignIcon";
import NextIcon from "@/components/icons/NextIcon";
import PatientIcon from "@/components/icons/PatientIcon";
import { Button } from "@/components/ui";
import { doctorAppointmentsQuery } from "@/lib/react-query/queryOptions";
import { cnJoin } from "@/lib/utils/cn";
import { AppointmentCardSwitchShared } from "../../-components/appointments/AppointmentCardShared";
import { Main } from "../../-components/Main";

const statsArray = [
	{
		bgColor: "bg-[#f0fdf6]",
		icon: <DollarSignIcon className="fill-medinfo-primary-main" />,
		id: 1,
		title: "Net income",
		value: "$ 1200",
	},
	{
		bgColor: "bg-[#eff4fb]",
		icon: <PatientIcon className="fill-medinfo-state-info-darker" />,
		id: 2,
		title: "Number of patients",
		value: "890",
	},
	{
		bgColor: "bg-[#F8F5DB]",
		icon: <CalendarIcon width={44} height={44} className="fill-medinfo-state-warning-darker" />,
		id: 3,
		title: "Total appointments",
		value: "65",
	},
];

function DoctorPage() {
	const doctorAppointmentsQueryResult = useQuery(doctorAppointmentsQuery());

	const upcomingAppointments =
		doctorAppointmentsQueryResult.data?.data.appointments.filter((app) => app.status === "confirmed")
		?? [];

	const pendingAppointments =
		doctorAppointmentsQueryResult.data?.data.appointments.filter((app) => app.status === "pending")
		?? [];

	return (
		<Main className="gap-12">
			<section className="flex flex-col gap-6 md:flex-row">
				<ForWithWrapper
					className="flex w-full flex-col justify-between gap-6 md:max-w-[338px]"
					each={statsArray}
					renderItem={(stat) => (
						<li
							key={stat.id}
							className="flex items-start gap-3 rounded-[16px] border border-medinfo-secondary-main
								bg-white p-4 shadow-[0_4px_8px_theme(--color-medinfo-primary-main/0.25)] md:gap-4
								md:p-7"
						>
							<div className={cnJoin("size-[60px] rounded-[8px] p-2", stat.bgColor)}>
								{stat.icon}
							</div>

							<div className="flex flex-col gap-2">
								<h3 className="text-medinfo-dark-3">{stat.title}</h3>
								<p className="text-[22px] font-medium text-medinfo-dark-1">{stat.value}</p>
							</div>
						</li>
					)}
				/>

				<article
					className="flex grow flex-col gap-6 rounded-[16px] bg-white p-6
						shadow-[0_4px_8px_theme(--color-medinfo-primary-main/0.25)] md:p-7"
				>
					<header className="flex items-center justify-between">
						<h2 className="text-[22px] font-medium text-medinfo-primary-main md:text-[24px]">
							Overall activity
						</h2>
						<p className="font-normal text-medinfo-dark-2">2023</p>
					</header>

					<div className="flex min-h-[300px] items-center justify-center rounded-md bg-gray-50">
						<p className="text-medinfo-dark-3">Graph component will go here</p>
					</div>
				</article>
			</section>

			<section className="flex flex-col gap-8 md:flex-row md:gap-10">
				<article
					className="flex w-full flex-col gap-3 rounded-[16px] bg-white p-4
						shadow-[0_4px_8px_theme(--color-medinfo-primary-main/0.25)] md:gap-6 md:p-8"
				>
					<header
						className="flex flex-col items-start text-medinfo-dark-1 md:flex-row md:items-center
							md:justify-between"
					>
						<h2 className="text-[18px] font-medium md:text-[22px]">Upcoming appointments</h2>

						<NavLink
							href="/dashboard/doctor/appointments/upcoming"
							className="flex items-center gap-2 font-medium lg:text-[20px]"
						>
							See all
							<NextIcon />
						</NavLink>
					</header>

					<AppointmentCardSwitchShared
						isEmpty={upcomingAppointments.length === 0}
						isPending={doctorAppointmentsQueryResult.isPending}
						pendingClassNames={{ container: "flex flex-col gap-3 " }}
						emptyProps={{
							icon: "lucide:calendar-off",
							text: "No upcoming appointments found.",
						}}
					>
						<ForWithWrapper
							className="flex flex-col gap-3"
							each={upcomingAppointments.slice(0, 3)}
							renderItem={(appointment) => (
								<li
									key={appointment.id}
									className="flex w-full justify-between rounded-lg border
										border-medinfo-secondary-main px-5 py-4"
								>
									<div className="flex gap-3">
										<span className="size-14 shrink-0 rounded-full bg-gray-500" />

										<div className="flex flex-col gap-3">
											<h4 className="text-[18px] font-semibold text-medinfo-primary-darker">
												{appointment.patient.fullName}
											</h4>
											<p className="line-clamp-1 text-[14px] font-normal">
												{appointment.reason}
											</p>
										</div>
									</div>

									<span>{format(appointment.dateOfAppointment, "HH:mm")}</span>
								</li>
							)}
						/>
					</AppointmentCardSwitchShared>
				</article>

				<article
					className="flex w-full flex-col gap-3 rounded-[16px] bg-white p-4
						shadow-[0_4px_8px_theme(--color-medinfo-primary-main/0.25)] md:gap-6 md:p-8"
				>
					<header className="flex items-center justify-between">
						<h2 className="text-[18px] font-medium md:text-[22px]">Appointment requests</h2>

						<NavLink
							href="/dashboard/doctor/appointments/pending"
							className="flex items-center gap-2 font-medium lg:text-[20px]"
						>
							See all
							<NextIcon />
						</NavLink>
					</header>

					<AppointmentCardSwitchShared
						isEmpty={pendingAppointments.length === 0}
						isPending={doctorAppointmentsQueryResult.isPending}
						pendingClassNames={{ container: "flex flex-col gap-3" }}
						emptyProps={{
							icon: "lucide:calendar-off",
							text: "No appointment requests found.",
						}}
					>
						<ForWithWrapper
							className="flex flex-col gap-3"
							each={pendingAppointments.slice(0, 6)}
							renderItem={(request) => (
								<li
									key={request.id}
									className="flex w-full items-start justify-between rounded-lg border
										border-medinfo-secondary-main px-5 py-4"
								>
									<div className="flex gap-3">
										<span className="size-14 shrink-0 rounded-full bg-gray-500" />

										<div className="flex flex-col gap-1">
											<h4 className="text-[16px] font-semibold text-medinfo-primary-darker">
												{request.patient.fullName}
											</h4>
											<p className="line-clamp-1 text-[14px] font-normal text-medinfo-dark-3">
												{request.reason}
											</p>
											<p className="text-[12px] font-normal text-medinfo-dark-3">
												{format(request.dateOfAppointment, "do MMMM, yyyy")} -{" "}
												{format(request.dateOfAppointment, "HH:mm")}
											</p>
										</div>
									</div>

									<div className="flex gap-4">
										<Button unstyled={true} className="size-6.5">
											<IconBox
												icon="feather:x-circle"
												className="size-full text-medinfo-state-error-darker"
											/>
										</Button>

										<Button unstyled={true} className="size-6.5">
											<IconBox
												icon="material-symbols:check-circle-outline-rounded"
												className="size-full text-medinfo-state-success-darker"
											/>
										</Button>
									</div>
								</li>
							)}
						/>
					</AppointmentCardSwitchShared>
				</article>
			</section>
		</Main>
	);
}

export default DoctorPage;
