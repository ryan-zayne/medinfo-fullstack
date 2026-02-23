"use client";

import { useQuery } from "@tanstack/react-query";
import { AppointmentPageShared } from "@/app/(protected)/dashboard/-components/appointments/AppointmentPageShared";
import { ForWithWrapper } from "@/components/common";
import { doctorAppointmentsQuery } from "@/lib/react-query/queryOptions";
import { DoctorAppointmentCard } from "../DoctorAppointmentCard";

function DoctorAppointmentHistoryPage() {
	const doctorAppointmentsQueryResult = useQuery(doctorAppointmentsQuery());

	const historyAppointments =
		doctorAppointmentsQueryResult.data?.data.appointments.filter(
			(app) => app.status === "completed" || app.status === "cancelled"
		) ?? [];

	return (
		<AppointmentPageShared
			title="Appointment History"
			description="View your past patient consultations."
			isPending={doctorAppointmentsQueryResult.isPending}
			isEmpty={historyAppointments.length === 0}
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
					<DoctorAppointmentCard key={appointment.id} appointment={appointment} variant="history" />
				)}
			/>
		</AppointmentPageShared>
	);
}

export default DoctorAppointmentHistoryPage;
