import CalendarIcon from "@/components/icons/CalendarIcon";
import CommunityIcon from "@/components/icons/CommunityIcon";
import DashboardIcon from "@/components/icons/DashboardIcon";
import LogoutIcon from "@/components/icons/LogoutIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import ProfileIcon from "@/components/icons/ProfileIcon";
import SettingsIcon from "@/components/icons/SettingsIcon";
import type { MenuItem } from "../../-components/HeaderShared";

export const menuItems = [
	{
		href: "/dashboard/doctor",
		icon: <DashboardIcon fill="#FFFFFF" width={20} height={20} />,
		iconActive: <DashboardIcon fill="#344E41" width={20} height={20} />,
		title: "Dashboard",
	},
	{
		children: [
			{ href: "/dashboard/doctor/appointments/pending", title: "Requests" },
			{ href: "/dashboard/doctor/appointments/upcoming", title: "Upcoming" },
			{ href: "/dashboard/doctor/appointments/history", title: "History" },
		],
		icon: <CalendarIcon fill="#FFFFFF" width={20} height={20} />,
		iconActive: <CalendarIcon fill="#344E41" width={20} height={20} />,
		title: "Appointments",
	},
	{
		href: "/dashboard/doctor/messages",
		icon: <MessageIcon fill="#FFFFFF" width={20} height={20} />,
		iconActive: <MessageIcon fill="#344E41" width={20} height={20} />,
		title: "Messages",
	},
	{
		href: "/dashboard/doctor/community",
		icon: <CommunityIcon fill="#FFFFFF" width={20} height={20} />,
		iconActive: <CommunityIcon fill="#344E41" width={20} height={20} />,
		title: "Community",
	},
	{
		href: "/dashboard/doctor/profile",
		icon: <ProfileIcon fill="#FFFFFF" width={20} height={20} />,
		iconActive: <ProfileIcon fill="#344E41" width={20} height={20} />,
		title: "Profile",
	},
	{
		href: "/dashboard/doctor/settings",
		icon: <SettingsIcon fill="#FFFFFF" width={20} height={20} />,
		iconActive: <SettingsIcon fill="#344E41" width={20} height={20} />,
		title: "Settings",
	},
	{
		href: null,
		icon: <LogoutIcon fill="#FFFFFF" width={20} height={20} />,
		iconActive: <LogoutIcon fill="#344E41" width={20} height={20} />,
		title: "Logout",
	},
] satisfies MenuItem[];
