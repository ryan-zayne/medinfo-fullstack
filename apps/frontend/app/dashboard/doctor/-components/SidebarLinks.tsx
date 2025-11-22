import CommunityIcon from "@/components/icons/CommunityIcon";
import DashboardIcon from "@/components/icons/DashboardIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import ProfileIcon from "@/components/icons/ProfileIcon";
import SettingsIcon from "@/components/icons/SettingsIcon";

type MenuItem = {
	href: string;
	icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
	title: string;
};

export const menuItems: MenuItem[] = [
	{
		href: "/doctor",
		icon: DashboardIcon,
		title: "Dashboard",
	},
	{
		href: "/doctor/messages",
		icon: MessageIcon,
		title: "Messages",
	},
	{
		href: "/doctor/community",
		icon: CommunityIcon,
		title: "Community",
	},
	{
		href: "/doctor/profile",
		icon: ProfileIcon,
		title: "Profile",
	},
	{
		href: "/doctor/settings",
		icon: SettingsIcon,
		title: "Settings",
	},
];
