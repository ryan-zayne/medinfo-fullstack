import { useMutation } from "@tanstack/react-query";
import { useDisclosure } from "@zayne-labs/toolkit-react";
import { AppointmentCardShared } from "@/app/(protected)/dashboard/-components/appointments/AppointmentCardShared";
import { DialogAnimated } from "@/components/animated/ui";
import { Button } from "@/components/ui";
import { updateAppointmentStatusMutation } from "@/lib/react-query/mutationOptions";
import {
	doctorAppointmentsQuery,
	type DoctorAppointmentQueryResultType,
} from "@/lib/react-query/queryOptions";

type DoctorAppointmentCardProps = {
	appointment: DoctorAppointmentQueryResultType["data"]["appointments"][number];
	variant: "history" | "upcoming";
};

export function DoctorAppointmentCard(props: DoctorAppointmentCardProps) {
	const { appointment, variant } = props;
	const updateStatusMutation = useMutation(updateAppointmentStatusMutation());
	const completeDisclosure = useDisclosure();

	const handleStatusUpdate = (status: "completed" | "confirmed") => {
		updateStatusMutation.mutate(
			{
				appointmentId: appointment.id,
				status,
			},
			{
				onSuccess: (_data, _vars, _result, context) => {
					void context.client.invalidateQueries(doctorAppointmentsQuery());
					completeDisclosure.onClose();
				},
			}
		);
	};

	return (
		<>
			<AppointmentCardShared
				variant={variant}
				appointment={{
					avatar: appointment.patientAvatar,
					cancelledAt: appointment.cancelledAt,
					dateOfAppointment: appointment.dateOfAppointment,
					id: appointment.id,
					name: appointment.patientName,
					reason: appointment.reason,
					status: appointment.status,
				}}
			>
				<div className="flex gap-2">
					{appointment.status === "pending" && (
						<Button
							theme="primary"
							onClick={() => handleStatusUpdate("confirmed")}
							disabled={updateStatusMutation.isPending}
							isLoading={updateStatusMutation.isPending}
						>
							Confirm
						</Button>
					)}
					{appointment.status === "confirmed" && (
						<Button
							theme="primary"
							onClick={completeDisclosure.onOpen}
							disabled={updateStatusMutation.isPending}
						>
							Complete
						</Button>
					)}
				</div>
			</AppointmentCardShared>

			<DialogAnimated.Root open={completeDisclosure.isOpen} onOpenChange={completeDisclosure.onToggle}>
				<DialogAnimated.Content className="flex max-w-sm flex-col gap-6 rounded-2xl border-none p-6">
					<DialogAnimated.Header>
						<DialogAnimated.Title className="text-xl font-semibold text-medinfo-dark-1">
							Complete Appointment
						</DialogAnimated.Title>
						<DialogAnimated.Description className="mt-2 text-medinfo-dark-4">
							Are you sure you want to mark this appointment with {appointment.patientName} as
							completed? This action will move it to the history.
						</DialogAnimated.Description>
					</DialogAnimated.Header>

					<DialogAnimated.Footer className="flex justify-end gap-3">
						<Button
							theme="primary-inverse"
							onClick={() => handleStatusUpdate("completed")}
							isLoading={updateStatusMutation.isPending}
							disabled={updateStatusMutation.isPending}
						>
							Yes, Complete
						</Button>
						<Button theme="primary" onClick={completeDisclosure.onClose}>
							No, Not yet
						</Button>
					</DialogAnimated.Footer>
				</DialogAnimated.Content>
			</DialogAnimated.Root>
		</>
	);
}
