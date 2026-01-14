import { Main } from "@/app/(protected)/dashboard/-components/Main";
import { ForWithWrapper, IconBox, Switch } from "@/components/common";
import { Skeleton } from "@/components/ui";

type AppointmentPageSharedProps = {
	children: React.ReactNode;
	description: string;
	emptyState: {
		icon: string;
		text: string;
	};
	isEmpty: boolean;
	isPending: boolean;
	title: string;
};

export function AppointmentPageShared(props: AppointmentPageSharedProps) {
	const { children, description, emptyState, isEmpty, isPending, title } = props;

	return (
		<Main className="gap-8">
			<header className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold text-medinfo-dark-1 md:text-3xl">{title}</h1>
				<p className="text-medinfo-dark-4">{description}</p>
			</header>

			<Switch.Root>
				<Switch.Match when={isPending}>
					<ForWithWrapper
						as="div"
						className="flex flex-col gap-4"
						each={3}
						renderItem={(index) => (
							<Skeleton key={index} className="h-32 w-full rounded-2xl shadow-sm" />
						)}
					/>
				</Switch.Match>

				<Switch.Match when={isEmpty}>
					<div
						className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white py-20
							shadow-sm"
					>
						<IconBox icon={emptyState.icon} className="size-16 text-medinfo-light-2" />
						<p className="text-lg font-medium text-medinfo-dark-4">{emptyState.text}</p>
					</div>
				</Switch.Match>

				<Switch.Default>{children}</Switch.Default>
			</Switch.Root>
		</Main>
	);
}
