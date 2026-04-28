"use client";

import { useQuery } from "@tanstack/react-query";
import { AppointmentPageShared } from "@/app/(protected)/dashboard/-components/appointments/AppointmentPageShared";
import { ForWithWrapper } from "@/components/common/for";
import { patientAppointmentsQuery } from "@/lib/react-query/queryOptions";
import { PatientAppointmentCard } from "../PatientAppointmentCard";

function UpcomingAppointmentsPage() {
	const patientAppointmentsQueryResult = useQuery(patientAppointmentsQuery());

	const upcomingAppointments =
		patientAppointmentsQueryResult.data?.data.appointments.filter((app) => app.status === "confirmed")
		?? [];

	return (
		<AppointmentPageShared
			title="Upcoming Appointments"
			description="Manage your scheduled consultations with doctors."
			isEmpty={upcomingAppointments.length === 0}
			isPending={patientAppointmentsQueryResult.isPending}
			emptyProps={{
				icon: "lucide:calendar-off",
				text: "No upcoming appointments found.",
			}}
		>
			<ForWithWrapper
				as="div"
				className="flex flex-col gap-4"
				each={upcomingAppointments}
				renderItem={(appointment) => (
					<PatientAppointmentCard key={appointment.id} appointment={appointment} variant="upcoming" />
				)}
			/>
		</AppointmentPageShared>
	);
}

export default UpcomingAppointmentsPage;
