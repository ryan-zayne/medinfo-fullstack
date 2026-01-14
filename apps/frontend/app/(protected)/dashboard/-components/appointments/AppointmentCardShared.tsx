import { format } from "date-fns";
import { AvatarGroupAnimated } from "@/components/animated/ui";
import { Show } from "@/components/common";
import { Avatar, Card } from "@/components/ui";
import type {
	DoctorAppointmentQueryResultType,
	PatientAppointmentQueryResultType,
} from "@/lib/react-query/queryOptions";
import { cnMerge } from "@/lib/utils/cn";

export type AppointmentCardSharedProps = {
	appointment: Pick<
		DoctorAppointmentQueryResultType["data"]["appointments"][number]
			& PatientAppointmentQueryResultType["data"]["appointments"][number],
		"cancelledAt" | "dateOfAppointment" | "id" | "reason" | "status"
	> & {
		avatar: PatientAppointmentQueryResultType["data"]["appointments"][number]["doctorAvatar"];
		name: PatientAppointmentQueryResultType["data"]["appointments"][number]["doctorName"];
	};
	children: React.ReactNode;
	variant: "history" | "upcoming";
};

const getInitials = (name: AppointmentCardSharedProps["appointment"]["name"]) => {
	const [firstName, lastName] = name.split(" ");
	return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
};

export function AppointmentCardShared(props: AppointmentCardSharedProps) {
	const { appointment, children, variant } = props;

	return (
		<Card.Root
			className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-md md:flex-row md:items-center
				md:justify-between"
		>
			<Card.Content className="flex gap-4">
				<AvatarGroupAnimated.Root className="space-x-0" translate="5%">
					<Avatar.Root className="size-14 rounded-full border border-medinfo-light-2">
						<Avatar.Image src={appointment.avatar} alt={appointment.name} />
						<Avatar.Fallback
							className="bg-medinfo-secondary-main text-lg font-bold text-medinfo-primary-darker"
						>
							{getInitials(appointment.name)}
						</Avatar.Fallback>

						<AvatarGroupAnimated.Tooltip
							classNames={{ base: "bg-medinfo-primary-darker text-white" }}
						>
							{appointment.name}
						</AvatarGroupAnimated.Tooltip>
					</Avatar.Root>
				</AvatarGroupAnimated.Root>

				<div className="flex flex-col gap-1">
					<h3 className="text-lg font-semibold text-medinfo-dark-1">{appointment.name}</h3>
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
			</Card.Content>

			<Card.Footer className="flex flex-col gap-3 md:flex-row md:items-center">
				<span
					className={cnMerge(
						"w-fit rounded-full px-3 py-1 text-xs font-medium capitalize",
						appointment.status === "pending"
							&& "bg-medinfo-state-warning-subtle text-medinfo-state-warning-darker",
						appointment.status === "confirmed"
							&& "bg-medinfo-state-success-subtle text-medinfo-state-success-darker",
						appointment.status === "cancelled"
							&& "bg-medinfo-state-error-subtle text-medinfo-state-error-darker",
						appointment.status === "completed"
							&& "bg-medinfo-state-info-subtle text-medinfo-state-info-darker"
					)}
				>
					{appointment.status}
				</span>

				<Show.Root when={variant === "upcoming"}>{children}</Show.Root>
			</Card.Footer>
		</Card.Root>
	);
}
