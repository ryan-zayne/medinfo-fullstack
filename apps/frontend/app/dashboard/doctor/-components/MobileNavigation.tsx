import { Logo, NavLink } from "@/components/common";
import CommunityIcon from "@/components/icons/CommunityIcon";
import DashboardIcon from "@/components/icons/DashboardIcon";
import LogoutIcon from "@/components/icons/LogoutIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import ProfileIcon from "@/components/icons/ProfileIcon";
import SettingsIcon from "@/components/icons/SettingsIcon";
import { cnMerge } from "@/lib/utils/cn";

type MobileNavProps = {
	className?: string;
	isNavShow: boolean;
	toggleNavShow: () => void;
};

function MobileNavigation(props: MobileNavProps) {
	const { className, isNavShow, toggleNavShow } = props;

	return (
		<article
			className={cnMerge(
				`fixed inset-[0_0_0_auto] flex flex-col items-center gap-7 overflow-hidden
				bg-medinfo-primary-main pt-10 text-white`,
				isNavShow ? "w-full [transition:width_350ms_ease]" : "w-0 [transition:width_500ms_ease]",
				className
			)}
			onClick={(event) => {
				const element = event.target as HTMLElement;

				element.tagName === "A" && toggleNavShow();
			}}
		>
			<Logo type="footer" className="h-[46px] w-[60px]" />

			<nav
				className="mt-[32px] flex flex-col justify-start gap-5 font-medium text-nowrap lg:text-[22px]"
			>
				<NavLink transitionType="navbar" href="/doctor" className="flex items-center gap-[16px]">
					<DashboardIcon className="fill-white" />
					Dashboard
				</NavLink>
				<NavLink
					transitionType="navbar"
					href="/doctor/messages"
					className="flex items-center gap-[16px]"
				>
					<MessageIcon className="fill-white" />
					Messages
				</NavLink>
				<NavLink
					transitionType="navbar"
					href="/doctor/community"
					className="flex items-center gap-[16px]"
				>
					<CommunityIcon className="fill-white" />
					Community
				</NavLink>
				<NavLink
					transitionType="navbar"
					href="/doctor/profile"
					className="flex items-center gap-[16px]"
				>
					<ProfileIcon className="fill-white" />
					Profile
				</NavLink>
				<NavLink
					transitionType="navbar"
					href="/doctor/settings"
					className="flex items-center gap-[16px]"
				>
					<SettingsIcon className="fill-white" />
					Settings
				</NavLink>
				<NavLink transitionType="navbar" href="/" className="mt-[32px] flex items-center gap-[16px]">
					<LogoutIcon className="fill-white" />
					Log out
				</NavLink>
			</nav>
		</article>
	);
}

export default MobileNavigation;
