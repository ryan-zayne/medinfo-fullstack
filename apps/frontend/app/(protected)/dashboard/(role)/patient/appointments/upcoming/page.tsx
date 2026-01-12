"use client";

import { useQuery } from "@tanstack/react-query";
import { Main } from "@/app/(protected)/dashboard/-components/Main";
import { ForWithWrapper, IconBox, Switch } from "@/components/common";
import { Skeleton } from "@/components/ui";
import { patientAppointmentsQuery } from "@/lib/react-query/queryOptions";
import { AppointmentCard } from "../-components/AppointmentCard";

function UpcomingAppointmentsPage() {
	const patientAppointmentsQueryResult = useQuery(patientAppointmentsQuery());

	const upcomingAppointments =
		patientAppointmentsQueryResult.data?.data.appointments.filter(
			(app) => app.status === "pending" || app.status === "confirmed"
		) ?? [];

	return (
		<Main className="gap-8">
			<header className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold text-medinfo-dark-1 md:text-3xl">Upcoming Appointments</h1>
				<p className="text-medinfo-dark-4">Manage your scheduled consultations here.</p>
			</header>

			<Switch.Root>
				<Switch.Match when={patientAppointmentsQueryResult.isPending}>
					<ForWithWrapper
						as="div"
						className="flex flex-col gap-4"
						each={3}
						renderItem={(index) => (
							<Skeleton key={index} className="h-32 w-full rounded-2xl shadow-sm" />
						)}
					/>
				</Switch.Match>

				<Switch.Match when={upcomingAppointments.length === 0}>
					<div
						className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white py-20
							shadow-sm"
					>
						<IconBox icon="lucide:calendar-off" className="size-16 text-medinfo-light-2" />
						<p className="text-lg font-medium text-medinfo-dark-4">
							No upcoming appointments found.
						</p>
					</div>
				</Switch.Match>

				<Switch.Default>
					<ForWithWrapper
						as="div"
						className="flex flex-col gap-4"
						each={upcomingAppointments}
						renderItem={(appointment) => (
							<AppointmentCard key={appointment.id} appointment={appointment} variant="upcoming" />
						)}
					/>
				</Switch.Default>
			</Switch.Root>
		</Main>
	);
}

export default UpcomingAppointmentsPage;
