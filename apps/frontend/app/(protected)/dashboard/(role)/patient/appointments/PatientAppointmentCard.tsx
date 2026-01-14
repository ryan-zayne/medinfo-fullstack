import { useMutation } from "@tanstack/react-query";
import { useDisclosure } from "@zayne-labs/toolkit-react";
import Link from "next/link";
import {
	AppointmentCardShared,
	type AppointmentCardSharedProps,
} from "@/app/(protected)/dashboard/-components/appointments/AppointmentCardShared";
import { DialogAnimated } from "@/components/animated/ui";
import { Button } from "@/components/ui";
import { cancelAppointmentMutation } from "@/lib/react-query/mutationOptions";
import {
	patientAppointmentsQuery,
	type PatientAppointmentQueryResultType,
} from "@/lib/react-query/queryOptions";

type PatientAppointmentCardProps = Pick<AppointmentCardSharedProps, "variant"> & {
	appointment: PatientAppointmentQueryResultType["data"]["appointments"][number];
};

export function PatientAppointmentCard(props: PatientAppointmentCardProps) {
	const { appointment, variant } = props;
	const cancelMutation = useMutation(cancelAppointmentMutation());
	const cancelDisclosure = useDisclosure();

	const handleCancel = () => {
		cancelMutation.mutate(
			{
				appointmentId: appointment.id,
			},
			{
				onSuccess: (_data, _vars, _result, context) => {
					void context.client.invalidateQueries(patientAppointmentsQuery());
					cancelDisclosure.onClose();
				},
			}
		);
	};

	return (
		<>
			<AppointmentCardShared
				variant={variant}
				appointment={{
					avatar: appointment.doctorAvatar,
					cancelledAt: appointment.cancelledAt,
					dateOfAppointment: appointment.dateOfAppointment,
					id: appointment.id,
					name: `Dr. ${appointment.doctorName}`,
					reason: appointment.reason,
					status: appointment.status,
				}}
			>
				<div className="flex gap-2">
					{appointment.status === "confirmed" && appointment.meetingURL && (
						<Button theme="primary" asChild={true}>
							<Link href={appointment.meetingURL} target="_blank" rel="noopener noreferrer">
								Join Meeting
							</Link>
						</Button>
					)}

					{(appointment.status === "pending" || appointment.status === "confirmed") && (
						<Button theme="secondary" onClick={cancelDisclosure.onOpen}>
							Cancel
						</Button>
					)}
				</div>
			</AppointmentCardShared>

			<DialogAnimated.Root open={cancelDisclosure.isOpen} onOpenChange={cancelDisclosure.onToggle}>
				<DialogAnimated.Content className="flex max-w-sm flex-col gap-6 rounded-2xl border-none p-6">
					<DialogAnimated.Header>
						<DialogAnimated.Title className="text-xl font-semibold text-medinfo-dark-1">
							Cancel Appointment
						</DialogAnimated.Title>
						<DialogAnimated.Description className="mt-2 text-medinfo-dark-4">
							Are you sure you want to cancel your appointment with Dr. {appointment.doctorName}?
							This action cannot be undone.
						</DialogAnimated.Description>
					</DialogAnimated.Header>

					<DialogAnimated.Footer className="flex justify-end gap-3">
						<Button
							theme="secondary"
							onClick={handleCancel}
							isLoading={cancelMutation.isPending}
							disabled={cancelMutation.isPending}
						>
							Yes, Cancel
						</Button>
						<Button theme="primary" onClick={cancelDisclosure.onClose}>
							No, Keep it
						</Button>
					</DialogAnimated.Footer>
				</DialogAnimated.Content>
			</DialogAnimated.Root>
		</>
	);
}
