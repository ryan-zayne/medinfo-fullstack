import { useMutation } from "@tanstack/react-query";
import { useDisclosure } from "@zayne-labs/toolkit-react";
import { format } from "date-fns";
import { AvatarGroupAnimated, DialogAnimated } from "@/components/animated/ui";
import { Avatar, Button } from "@/components/ui";
import { cancelAppointmentMutation } from "@/lib/react-query/mutationOptions";
import {
	patientAppointmentsQuery,
	type PatientAppointmentQueryResultType,
} from "@/lib/react-query/queryOptions";
import { cnMerge } from "@/lib/utils/cn";

type AppointmentCardProps = {
	appointment: PatientAppointmentQueryResultType["data"]["appointments"][number];
	variant: "history" | "upcoming";
};

const getInitials = (name: string) => {
	const names = name.split(" ");

	return `${names[0]?.[0]}${names[1]?.[0]}`.toUpperCase();
};

export function AppointmentCard(props: AppointmentCardProps) {
	const { appointment, variant } = props;
	const cancelMutation = useMutation(cancelAppointmentMutation());
	const cancelDisclosure = useDisclosure();

	const handleCancel = () => {
		cancelMutation.mutate(
			{
				appointmentId: appointment.id,
				meetingId: appointment.meetingId,
			},
			{
				onSuccess: (_data, _vars, _result, context) => {
					void context.client.invalidateQueries(patientAppointmentsQuery());
					cancelDisclosure.onClose();
				},
			}
		);
	};

	const isUpcoming = variant === "upcoming";

	return (
		<div
			className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-md md:flex-row md:items-center
				md:justify-between"
		>
			<div className="flex gap-4">
				<AvatarGroupAnimated.Root className="space-x-0" translate="5%">
					<Avatar.Root className="size-14 rounded-full border border-medinfo-light-2">
						<Avatar.Image src={appointment.doctorAvatar} alt={appointment.doctorName} />
						<Avatar.Fallback
							className="bg-medinfo-secondary-main text-lg font-bold text-medinfo-primary-darker"
						>
							{getInitials(appointment.doctorName)}
						</Avatar.Fallback>

						<AvatarGroupAnimated.Tooltip
							classNames={{ base: "bg-medinfo-primary-darker text-white" }}
						>
							{appointment.doctorName}
						</AvatarGroupAnimated.Tooltip>
					</Avatar.Root>
				</AvatarGroupAnimated.Root>

				<div className="flex flex-col gap-1">
					<h3 className="text-lg font-semibold text-medinfo-dark-1">Dr. {appointment.doctorName}</h3>
					<p className="text-sm text-medinfo-dark-3">{appointment.reason}</p>
					<p className="text-sm font-medium text-medinfo-primary-main">
						{format(appointment.dateOfAppointment, "PPP 'at' p")}
					</p>

					{appointment.status === "cancelled" && appointment.cancelledAt && (
						<p className="text-xs text-medinfo-state-error-main italic">
							Cancelled on {format(appointment.cancelledAt, "PPP 'at' p")}
						</p>
					)}
				</div>
			</div>

			<div className="flex flex-col gap-3 md:flex-row md:items-center">
				<span
					className={cnMerge(
						"w-fit rounded-full px-3 py-1 text-xs font-medium capitalize",
						appointment.status === "pending" && "bg-yellow-100 text-yellow-700",
						appointment.status === "confirmed" && "bg-green-100 text-green-700",
						appointment.status === "cancelled" && "bg-red-100 text-red-700",
						appointment.status === "completed" && "bg-blue-100 text-blue-700"
					)}
				>
					{appointment.status}
				</span>

				{isUpcoming && (appointment.status === "pending" || appointment.status === "confirmed") && (
					<div className="flex gap-2">
						{appointment.status === "confirmed" && (
							<Button asChild={true} theme="primary">
								<a href={appointment.meetingURL} target="_blank" rel="noreferrer">
									Join Meeting
								</a>
							</Button>
						)}

						<Button theme="secondary" onClick={cancelDisclosure.onOpen}>
							Cancel
						</Button>
					</div>
				)}
			</div>

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
		</div>
	);
}
