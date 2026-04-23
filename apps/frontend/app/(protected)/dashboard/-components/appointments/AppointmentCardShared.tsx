import { format } from "date-fns";
import { AvatarGroupAnimated } from "@/components/animated/ui";
import { ForWithWrapper, IconBox, Switch } from "@/components/common";
import { Avatar, Card, Skeleton } from "@/components/ui";
import type {
	DoctorAppointmentQueryResultType,
	PatientAppointmentQueryResultType,
} from "@/lib/react-query/queryOptions";
import { cnMerge } from "@/lib/utils/cn";

export type AppointmentCardSharedProps = {
	appointment:
		| DoctorAppointmentQueryResultType["data"]["appointments"][number]
		| PatientAppointmentQueryResultType["data"]["appointments"][number];
	children: React.ReactNode;
	className?: string;
	variant: "history" | "upcoming";
};

export function AppointmentCardShared(props: AppointmentCardSharedProps) {
	const { appointment, children, className, variant } = props;

	const otherPartyDetails = appointment.role === "doctor" ? appointment.patient : appointment.doctor;

	const otherPartyFullName =
		appointment.role === "patient" ? `Dr. ${otherPartyDetails.fullName}` : otherPartyDetails.fullName;

	return (
		<Card.Root
			className={cnMerge(
				`flex flex-col justify-between gap-4 rounded-[8px] border-[1.4px] border-medinfo-secondary-main
				bg-white p-6 md:flex-row md:items-center`,
				className
			)}
		>
			<Card.Content className="flex gap-4">
				<AvatarGroupAnimated.Root className="space-x-0" translate="5%">
					<Avatar.Root className="size-14 rounded-full border border-medinfo-light-2">
						<Avatar.Image src={otherPartyDetails.avatar} alt={otherPartyFullName} />
						<Avatar.Fallback className="bg-medinfo-secondary-main text-lg font-bold text-medinfo-primary-darker">
							{otherPartyDetails.firstName[0]}
							{otherPartyDetails.lastName[0]}
						</Avatar.Fallback>

						<AvatarGroupAnimated.Tooltip
							classNames={{ base: "bg-medinfo-primary-darker text-white" }}
						>
							{otherPartyFullName}
						</AvatarGroupAnimated.Tooltip>
					</Avatar.Root>
				</AvatarGroupAnimated.Root>

				<div className="flex flex-col gap-1">
					<h3 className="text-lg font-semibold text-medinfo-dark-1">{otherPartyFullName}</h3>
					<p className="text-sm text-medinfo-dark-3">{appointment.reason}</p>
					<p className="text-sm font-medium text-medinfo-primary-main">
						{format(appointment.dateOfAppointment, "PPP '-' p")}
					</p>

					{appointment.status === "cancelled" && appointment.cancelledAt && (
						<p className="text-xs text-medinfo-state-error-main italic">
							Cancelled on {format(appointment.cancelledAt, "PPP '-' p")}
						</p>
					)}
				</div>
			</Card.Content>

			<Card.Footer>{variant === "upcoming" && children}</Card.Footer>
		</Card.Root>
	);
}

export function AppointmentCardSkeletonShared() {
	return (
		<div
			className="flex items-center justify-between gap-4 rounded-2xl border
				border-medinfo-secondary-main bg-white p-6"
		>
			<div className="flex gap-4">
				<Skeleton className="size-14 rounded-full" />

				<div className="flex flex-col gap-2">
					<Skeleton className="h-5 w-32" />
					<Skeleton className="h-4 w-48" />
					<Skeleton className="h-4 w-40" />
				</div>
			</div>

			<div className="flex gap-2">
				<Skeleton className="h-10 w-24 rounded-lg" />
				<Skeleton className="h-10 w-24 rounded-lg" />
			</div>
		</div>
	);
}

type AppointmentCardEmptySharedProps = {
	className?: string;
	icon: string;
	text: string;
};

export function AppointmentCardEmptyShared(props: AppointmentCardEmptySharedProps) {
	const { className, icon, text } = props;

	return (
		<div
			className={cnMerge(
				`flex flex-col items-center justify-center gap-6 rounded-[8px] border-[1.4px]
				border-medinfo-secondary-main bg-white px-8 py-20`,
				className
			)}
		>
			<IconBox icon={icon} className="size-16 text-medinfo-light-2" />

			<p className="text-center font-medium text-medinfo-dark-4">{text}</p>
		</div>
	);
}

export type AppointmentCardSwitchSharedProps = {
	children: React.ReactNode;
	emptyProps: AppointmentCardEmptySharedProps;
	isEmpty: boolean | undefined;
	isPending: boolean | undefined;
	pendingClassNames?: {
		container?: string;
	};
};

export function AppointmentCardSwitchShared(props: AppointmentCardSwitchSharedProps) {
	const { children, emptyProps, isEmpty, isPending, pendingClassNames } = props;

	return (
		<Switch.Root>
			<Switch.Match when={isPending}>
				<ForWithWrapper
					as="div"
					className={cnMerge("flex flex-col gap-4", pendingClassNames?.container)}
					each={3}
					renderItem={(index) => <AppointmentCardSkeletonShared key={index} />}
				/>
			</Switch.Match>

			<Switch.Match when={isEmpty}>
				<AppointmentCardEmptyShared {...emptyProps} />
			</Switch.Match>

			<Switch.Default>{children}</Switch.Default>
		</Switch.Root>
	);
}
