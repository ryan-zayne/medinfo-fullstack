"use client";

import { useQuery } from "@tanstack/react-query";
import { AppointmentPageShared } from "@/app/(protected)/dashboard/-components/appointments/AppointmentPageShared";
import { ForWithWrapper } from "@/components/common";
import { patientAppointmentsQuery } from "@/lib/react-query/queryOptions";
import { PatientAppointmentCard } from "../PatientAppointmentCard";

function PatientAppointmentRequestsPage() {
	const patientAppointmentsQueryResult = useQuery(patientAppointmentsQuery());

	const pendingAppointments =
		patientAppointmentsQueryResult.data?.data.appointments.filter((app) => app.status === "pending")
		?? [];

	return (
		<AppointmentPageShared
			title="Appointment Requests"
			description="Manage your appointment requests with doctors."
			isEmpty={pendingAppointments.length === 0}
			isPending={patientAppointmentsQueryResult.isPending}
			emptyProps={{
				icon: "lucide:calendar-off",
				text: "No appointment requests found.",
			}}
		>
			<ForWithWrapper
				as="div"
				className="flex flex-col gap-4"
				each={pendingAppointments}
				renderItem={(appointment) => (
					<PatientAppointmentCard key={appointment.id} appointment={appointment} variant="upcoming" />
				)}
			/>
		</AppointmentPageShared>
	);
}

export default PatientAppointmentRequestsPage;
