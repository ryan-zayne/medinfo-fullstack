"use client";

import { useQuery } from "@tanstack/react-query";
import { Main } from "@/app/(protected)/dashboard/-components/Main";
import { ForWithWrapper, IconBox, Switch } from "@/components/common";
import { Skeleton } from "@/components/ui";
import { patientAppointmentsQuery } from "@/lib/react-query/queryOptions";
import { AppointmentCard } from "../-components/AppointmentCard";

function AppointmentHistoryPage() {
	const patientAppointmentsQueryResult = useQuery(patientAppointmentsQuery());

	const historyAppointments =
		patientAppointmentsQueryResult.data?.data.appointments.filter(
			(app) => app.status === "completed" || app.status === "cancelled"
		) ?? [];

	return (
		<Main className="gap-8">
			<header className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold text-medinfo-dark-1 md:text-3xl">Appointment History</h1>
				<p className="text-medinfo-dark-4">View your past medical consultations.</p>
			</header>

			<Switch.Root>
				<Switch.Match when={patientAppointmentsQueryResult.isPending}>
					<ForWithWrapper
						as="div"
						className="flex flex-col gap-4"
						each={2}
						renderItem={(index) => (
							<Skeleton key={index} className="h-32 w-full rounded-2xl shadow-sm" />
						)}
					/>
				</Switch.Match>

				<Switch.Match when={historyAppointments.length === 0}>
					<div
						className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white py-20
							shadow-sm"
					>
						<IconBox icon="lucide:history" className="size-16 text-medinfo-light-2" />
						<p className="text-lg font-medium text-medinfo-dark-4">No past appointments found.</p>
					</div>
				</Switch.Match>

				<Switch.Default>
					<ForWithWrapper
						as="div"
						className="flex flex-col gap-4"
						each={historyAppointments}
						renderItem={(appointment) => (
							<AppointmentCard key={appointment.id} appointment={appointment} variant="history" />
						)}
					/>
				</Switch.Default>
			</Switch.Root>
		</Main>
	);
}

export default AppointmentHistoryPage;
