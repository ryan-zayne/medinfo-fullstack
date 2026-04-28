"use client";

import { useQuery } from "@tanstack/react-query";
import { AppointmentPageShared } from "@/app/(protected)/dashboard/-components/appointments/AppointmentPageShared";
import { ForWithWrapper } from "@/components/common/for";
import { patientAppointmentsQuery } from "@/lib/react-query/queryOptions";
import { PatientAppointmentCard } from "../PatientAppointmentCard";

function AppointmentHistoryPage() {
	const patientAppointmentsQueryResult = useQuery(patientAppointmentsQuery());

	const historyAppointments =
		patientAppointmentsQueryResult.data?.data.appointments.filter(
			(app) => app.status === "completed" || app.status === "cancelled"
		) ?? [];

	return (
		<AppointmentPageShared
			title="Appointment History"
			description="View your past consultations and their status."
			isEmpty={historyAppointments.length === 0}
			isPending={patientAppointmentsQueryResult.isPending}
			emptyProps={{
				icon: "lucide:history",
				text: "No past appointments found.",
			}}
		>
			<ForWithWrapper
				as="div"
				className="flex flex-col gap-4"
				each={historyAppointments}
				renderItem={(appointment) => (
					<PatientAppointmentCard key={appointment.id} appointment={appointment} variant="history" />
				)}
			/>
		</AppointmentPageShared>
	);
}

export default AppointmentHistoryPage;
