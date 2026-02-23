"use client";

import { useQuery } from "@tanstack/react-query";
import { ForWithWrapper, NavLink } from "@/components/common";
import NextIcon from "@/components/icons/NextIcon";
import { patientAppointmentsQuery } from "@/lib/react-query/queryOptions";
import { AppointmentCardSwitchShared } from "../../-components/appointments/AppointmentCardShared";
import { Main } from "../../-components/Main";
import { PatientAppointmentCard } from "./appointments/PatientAppointmentCard";

const activityLogs = [
	{ id: 1, title: "Children's health" },
	{ id: 2, title: "Men's health" },
	{ id: 3, title: "Men's health" },
	{ id: 4, title: "Sexual health" },
	{ id: 5, title: "Children's health" },
	{ id: 6, title: "Men's health" },
	{ id: 7, title: "Sexual health" },
	{ id: 8, title: "Children's health" },
];

function PatientDashboardPage() {
	const patientAppointmentsQueryResult = useQuery(patientAppointmentsQuery());

	const upcomingAppointments =
		patientAppointmentsQueryResult.data?.data.appointments.filter((app) => app.status === "confirmed")
		?? [];

	return (
		<Main className="gap-12">
			<section className="flex flex-col gap-6 md:flex-row">
				<article
					className="flex w-full flex-col gap-7.5 rounded-[16px] bg-white p-4
						shadow-[0_4px_8px_theme(--color-medinfo-primary-main/0.25)] md:gap-[52px] md:p-8"
				>
					<header className="flex items-center justify-between">
						<h2 className="text-[22px] font-medium text-medinfo-primary-main md:text-[24px]">
							Overall activity
						</h2>
						<p className="font-normal text-medinfo-dark-2">2023</p>
					</header>

					<div className="flex grow items-center justify-center bg-gray-50">
						<p className="text-medinfo-dark-3">Graph component will go here</p>
					</div>
				</article>

				<article
					className="flex w-full flex-col gap-6 rounded-[16px] bg-white p-4
						shadow-[0_4px_8px_theme(--color-medinfo-primary-main/0.25)] md:max-w-[338px] md:p-8"
				>
					<h2 className="text-[22px] font-medium text-medinfo-primary-main md:text-[24px]">
						Activities
					</h2>

					<div className="rounded-[8px] border border-medinfo-secondary-main">
						<header
							className="flex gap-8 rounded-t-[8px] bg-medinfo-secondary-main py-2 pl-2
								font-semibold text-medinfo-dark-1"
						>
							<p>S/N</p>
							<p>Log</p>
						</header>

						<ForWithWrapper
							className="flex flex-col pl-2"
							each={activityLogs}
							renderItem={(log, index) => (
								<li key={log.id} className="flex gap-8 py-1 font-normal">
									<p className="w-7">{index + 1}</p>
									<p>{log.title}</p>
								</li>
							)}
						/>
					</div>
				</article>
			</section>

			<section
				className="flex flex-col gap-6 rounded-[16px] bg-white p-6
					shadow-[0_4px_8px_theme(--color-medinfo-primary-main/0.25)] md:p-8"
			>
				<header
					className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between"
				>
					<h2 className="text-[22px] font-medium text-medinfo-primary-main md:text-[24px]">
						Upcoming Appointments
					</h2>

					<NavLink
						href="/dashboard/patient/appointments/upcoming"
						className="flex items-center gap-2 font-medium lg:text-[20px]"
					>
						See all
						<NextIcon />
					</NavLink>
				</header>

				<AppointmentCardSwitchShared
					isEmpty={upcomingAppointments.length === 0}
					isPending={patientAppointmentsQueryResult.isPending}
					pendingClassNames={{ container: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-10" }}
					emptyProps={{
						icon: "lucide:calendar-off",
						text: "No upcoming appointments found.",
					}}
				>
					<ForWithWrapper
						className="flex flex-col gap-6 md:grid-cols-2 lg:gap-10"
						each={upcomingAppointments.slice(0, 6)}
						renderItem={(appointment) => (
							<PatientAppointmentCard
								key={appointment.id}
								appointment={appointment}
								variant="upcoming"
							/>
						)}
					/>
				</AppointmentCardSwitchShared>
			</section>
		</Main>
	);
}

export default PatientDashboardPage;
