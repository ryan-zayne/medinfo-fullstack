"use client";

import { useQuery } from "@tanstack/react-query";
import { AppointmentPageShared } from "@/app/(protected)/dashboard/-components/appointments/AppointmentPageShared";
import { ForWithWrapper } from "@/components/common";
import { doctorAppointmentsQuery } from "@/lib/react-query/queryOptions";
import { DoctorAppointmentCard } from "../DoctorAppointmentCard";

function DoctorUpcomingAppointmentsPage() {
	const doctorAppointmentsQueryResult = useQuery(doctorAppointmentsQuery());

	const pendingAppointments =
		doctorAppointmentsQueryResult.data?.data.appointments.filter((app) => app.status === "pending")
		?? [];

	return (
		<AppointmentPageShared
			title="Appointment Requests"
			description="Manage your appointment requests with patients."
			isEmpty={pendingAppointments.length === 0}
			isPending={doctorAppointmentsQueryResult.isPending}
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
					<DoctorAppointmentCard key={appointment.id} appointment={appointment} variant="upcoming" />
				)}
			/>
		</AppointmentPageShared>
	);
}

export default DoctorUpcomingAppointmentsPage;
