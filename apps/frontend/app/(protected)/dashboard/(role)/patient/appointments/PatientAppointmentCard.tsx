import { useMutation } from "@tanstack/react-query";
import { useDisclosure } from "@zayne-labs/toolkit-react";
import { isToday } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import {
	AppointmentCardShared,
	type AppointmentCardSharedProps,
} from "@/app/(protected)/dashboard/-components/appointments/AppointmentCardShared";
import { DialogAnimated } from "@/components/animated/ui";
import { IconBox } from "@/components/common/IconBox";
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

	const actionDisclosure = useDisclosure();

	type ActionType = "cancelled";

	const [actionType, setActionType] = useState<ActionType | null>(null);

	const handleCancel = () => {
		cancelMutation.mutate(
			{
				appointmentId: appointment.id,
			},
			{
				onSuccess: (_data, _vars, _result, context) => {
					void context.client.invalidateQueries(patientAppointmentsQuery());
					actionDisclosure.onClose();
				},
			}
		);
	};

	const onOpenDialog = (type: ActionType) => {
		setActionType(type);
		actionDisclosure.onOpen();
	};

	const dialogContent = {
		cancelled: {
			description: `Are you sure you want to cancel your appointment with Dr. ${appointment.doctor.fullName}? This action cannot be undone.`,
			title: "Cancel Appointment",
			yesText: "Yes, Cancel",
		},
	} satisfies Record<
		ActionType,
		{
			description: string;
			title: string;
			yesText: string;
		}
	>;

	const currentAction = actionType ? dialogContent[actionType] : null;

	return (
		<>
			<AppointmentCardShared variant={variant} appointment={appointment}>
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

				{appointment.status === "pending" && (
					<Button unstyled={true} className="size-6.5" onClick={() => onOpenDialog("cancelled")}>
						<IconBox icon="feather:x-circle" className="size-full text-medinfo-state-error-darker" />
					</Button>
				)}
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
							onClick={handleCancel}
							isLoading={cancelMutation.isPending}
							disabled={cancelMutation.isPending}
						>
							{currentAction?.yesText}
						</Button>
						<Button theme="primary" onClick={actionDisclosure.onClose}>
							No, Keep it
						</Button>
					</DialogAnimated.Footer>
				</DialogAnimated.Content>
			</DialogAnimated.Root>
		</>
	);
}
