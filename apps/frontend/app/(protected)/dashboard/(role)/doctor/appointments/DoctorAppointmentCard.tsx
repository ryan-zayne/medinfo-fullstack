import { useMutation } from "@tanstack/react-query";
import { useDisclosure } from "@zayne-labs/toolkit-react";
import { isToday } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { AppointmentCardShared } from "@/app/(protected)/dashboard/-components/appointments/AppointmentCardShared";
import { DialogAnimated } from "@/components/animated/ui";
import { IconBox } from "@/components/common";
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

	const actionDisclosure = useDisclosure();

	type StatusType = Parameters<typeof updateStatusMutation.mutate>[0]["status"];

	const [statusState, setStatusState] = useState<StatusType | null>(null);

	const handleStatusUpdate = (status: StatusType) => {
		updateStatusMutation.mutate(
			{
				appointmentId: appointment.id,
				status,
			},
			{
				onSuccess: (_data, _vars, _result, context) => {
					void context.client.invalidateQueries(doctorAppointmentsQuery());
					actionDisclosure.onClose();
				},
			}
		);
	};

	const handleOpenDialog = (type: StatusType) => {
		setStatusState(type);
		actionDisclosure.onOpen();
	};

	const dialogContent = {
		cancelled: {
			description: `Are you sure you want to cancel this appointment with ${appointment.patient.fullName}? This action cannot be undone.`,
			title: "Cancel Appointment",
			yesText: "Yes, Cancel",
		},
		completed: {
			description: `Are you sure you want to mark this appointment with ${appointment.patient.fullName} as completed? This action will move it to the history.`,
			title: "Complete Appointment",
			yesText: "Yes, Complete",
		},
		confirmed: {
			description: `Are you sure you want to confirm this appointment with ${appointment.patient.fullName}?`,
			title: "Confirm Appointment",
			yesText: "Yes, Confirm",
		},
	} satisfies Record<
		StatusType,
		{
			description: string;
			title: string;
			yesText: string;
		}
	>;

	const currentAction = statusState ? dialogContent[statusState] : null;

	return (
		<>
			<AppointmentCardShared variant={variant} appointment={appointment}>
				{appointment.status === "pending" && (
					<div className="flex gap-4">
						<Button
							unstyled={true}
							className="size-6.5"
							onClick={() => handleOpenDialog("cancelled")}
						>
							<IconBox
								icon="feather:x-circle"
								className="size-full text-medinfo-state-error-darker"
							/>
						</Button>

						<Button
							unstyled={true}
							className="size-6.5"
							onClick={() => handleOpenDialog("confirmed")}
						>
							<IconBox
								icon="material-symbols:check-circle-outline-rounded"
								className="size-full text-medinfo-state-success-darker"
							/>
						</Button>
					</div>
				)}

				{appointment.status === "confirmed" && appointment.meetingURL && (
					<Button
						theme="primary"
						size="large"
						asChild={true}
						isDisabled={!isToday(appointment.dateOfAppointment)}
					>
						<Link
							onClick={(event) => {
								if (!isToday(appointment.dateOfAppointment)) {
									event.preventDefault();
								}
							}}
							href={isToday(appointment.dateOfAppointment) ? appointment.meetingURL : ""}
							target="_blank"
							rel="noopener noreferrer"
						>
							Join Meeting
						</Link>
					</Button>
				)}

				{/* {appointment.status === "confirmed" && (
					<div className="flex gap-4">
						{appointment.meetingURL && (
							<Button theme="primary" asChild={true}>
								<Link href={appointment.meetingURL} target="_blank" rel="noopener noreferrer">
									Join Meeting
								</Link>
							</Button>
						)}

						<Button
							theme="primary"
							onClick={() => onOpenDialog("completed")}
							disabled={!isPast(appointment.dateOfAppointment) || updateStatusMutation.isPending}
						>
							Complete
						</Button>
					</div>
				)} */}
			</AppointmentCardShared>

			<DialogAnimated.Root open={actionDisclosure.isOpen} onOpenChange={actionDisclosure.onToggle}>
				<DialogAnimated.Content className="flex max-w-sm flex-col gap-6 rounded-2xl border-none p-6">
					<DialogAnimated.Header>
						<DialogAnimated.Title className="text-xl font-semibold text-medinfo-dark-1">
							{currentAction?.title}
						</DialogAnimated.Title>
						<DialogAnimated.Description className="mt-2 text-medinfo-dark-4">
							{currentAction?.description}
						</DialogAnimated.Description>
					</DialogAnimated.Header>

					<DialogAnimated.Footer className="flex justify-end gap-3">
						<Button
							theme="primary-ghost"
							onClick={() => statusState && handleStatusUpdate(statusState)}
							isLoading={updateStatusMutation.isPending}
							disabled={updateStatusMutation.isPending}
						>
							{currentAction?.yesText}
						</Button>
						<Button theme="primary" onClick={actionDisclosure.onClose}>
							No, Not yet
						</Button>
					</DialogAnimated.Footer>
				</DialogAnimated.Content>
			</DialogAnimated.Root>
		</>
	);
}
