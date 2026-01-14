"use client";

import { useQuery } from "@tanstack/react-query";
import { AppointmentPageShared } from "@/app/(protected)/dashboard/-components/appointments/AppointmentPageShared";
import { ForWithWrapper } from "@/components/common";
import { doctorAppointmentsQuery } from "@/lib/react-query/queryOptions";
import { DoctorAppointmentCard } from "../DoctorAppointmentCard";

function DoctorUpcomingAppointmentsPage() {
	const doctorAppointmentsQueryResult = useQuery(doctorAppointmentsQuery());

	const upcomingAppointments =
		doctorAppointmentsQueryResult.data?.data.appointments.filter(
			(app) => app.status === "pending" || app.status === "confirmed"
		) ?? [];

	return (
		<AppointmentPageShared
			title="Upcoming Appointments"
			description="Manage your scheduled consultations with patients."
			isEmpty={upcomingAppointments.length === 0}
			isPending={doctorAppointmentsQueryResult.isPending}
			emptyState={{
				icon: "lucide:calendar-off",
				text: "No upcoming appointments found.",
			}}
		>
			<ForWithWrapper
				as="div"
				className="flex flex-col gap-4"
				each={upcomingAppointments}
				renderItem={(appointment) => (
					<DoctorAppointmentCard key={appointment.id} appointment={appointment} variant="upcoming" />
				)}
			/>
		</AppointmentPageShared>
	);
}

export default DoctorUpcomingAppointmentsPage;
