import CommunityIcon from "@/components/icons/CommunityIcon";
import DashboardIcon from "@/components/icons/DashboardIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import ProfileIcon from "@/components/icons/ProfileIcon";
import SettingsIcon from "@/components/icons/SettingsIcon";

type MenuItem = {
	href: string;
	icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
	title: string;
};

export const menuItems: MenuItem[] = [
	{
		href: "/patient",
		icon: DashboardIcon,
		title: "Dashboard",
	},
	{
		href: "/patient/messages",
		icon: MessageIcon,
		title: "Messages",
	},
	{
		href: "/patient/community",
		icon: CommunityIcon,
		title: "Community",
	},
	{
		href: "/patient/profile",
		icon: ProfileIcon,
		title: "Profile",
	},
	{
		href: "/patient/settings",
		icon: SettingsIcon,
		title: "Settings",
	},
];
