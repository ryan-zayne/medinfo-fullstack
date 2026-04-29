import { Logo } from "@/app/-components/Logo";
import { GreenSpinnerIcon } from "@/components/icons/SpinnerIcon";

export function LoadingScreen() {
	return (
		<div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-white">
			<Logo className="h-[80px] w-[104px] animate-pulse" />

			<div className="flex flex-col items-center gap-4">
				<GreenSpinnerIcon className="animate-spin" />
				<p className="text-lg font-medium text-medinfo-primary-main">Loading...</p>
			</div>
		</div>
	);
}
