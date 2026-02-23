import { Main } from "@/app/(protected)/dashboard/-components/Main";
import {
	AppointmentCardSwitchShared,
	type AppointmentCardSwitchSharedProps,
} from "./AppointmentCardShared";

type AppointmentPageSharedProps = AppointmentCardSwitchSharedProps & {
	description: string;
	title: string;
};

export function AppointmentPageShared(props: AppointmentPageSharedProps) {
	const { description, title, ...restOfProps } = props;

	return (
		<Main className="gap-8">
			<header className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold text-medinfo-dark-1 md:text-3xl">{title}</h1>
				<p className="text-medinfo-dark-4">{description}</p>
			</header>

			<AppointmentCardSwitchShared {...restOfProps} />
		</Main>
	);
}
