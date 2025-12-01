import CommunityIcon from "@/components/icons/CommunityIcon";
import DashboardIcon from "@/components/icons/DashboardIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import ProfileIcon from "@/components/icons/ProfileIcon";
import SettingsIcon from "@/components/icons/SettingsIcon";
import type { MenuItem } from "../../-components/HeaderShared";

export const menuItems: MenuItem[] = [
	{
		href: "/dashboard/doctor",
		icon: <DashboardIcon fill="#FFFFFF" />,
		iconActive: <DashboardIcon fill="#344E41" />,
		title: "Dashboard",
	},
	{
		href: "/dashboard/doctor/messages",
		icon: <MessageIcon fill="#FFFFFF" />,
		iconActive: <MessageIcon fill="#344E41" />,
		title: "Messages",
	},
	{
		href: "/dashboard/doctor/community",
		icon: <CommunityIcon fill="#FFFFFF" />,
		iconActive: <CommunityIcon fill="#344E41" />,
		title: "Community",
	},
	{
		href: "/dashboard/doctor/profile",
		icon: <ProfileIcon fill="#FFFFFF" />,
		iconActive: <ProfileIcon fill="#344E41" />,
		title: "Profile",
	},
	{
		href: "/dashboard/doctor/settings",
		icon: <SettingsIcon fill="#FFFFFF" />,
		iconActive: <SettingsIcon fill="#344E41" />,
		title: "Settings",
	},
];
