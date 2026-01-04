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
		href: "/dashboard/patient",
		icon: <DashboardIcon fill="#FFFFFF" />,
		iconActive: <DashboardIcon fill="#344E41" />,
		title: "Dashboard",
	},
	{
		children: [
			{ href: "/dashboard/patient/appointments/book", title: "Book Appointment" },
			{ href: "/dashboard/patient/appointments/upcoming", title: "Upcoming" },
			{ href: "/dashboard/patient/appointments/history", title: "History" },
		],
		icon: <CalendarIcon fill="#FFFFFF" />,
		iconActive: <CalendarIcon fill="#344E41" />,
		title: "Appointments",
	},
	{
		href: "/dashboard/patient/messages",
		icon: <MessageIcon fill="#FFFFFF" />,
		iconActive: <MessageIcon fill="#344E41" />,
		title: "Messages",
	},
	{
		href: "/dashboard/patient/community",
		icon: <CommunityIcon fill="#FFFFFF" />,
		iconActive: <CommunityIcon fill="#344E41" />,
		title: "Community",
	},
	{
		href: "/dashboard/patient/profile",
		icon: <ProfileIcon fill="#FFFFFF" />,
		iconActive: <ProfileIcon fill="#344E41" />,
		title: "Profile",
	},
	{
		href: "/dashboard/patient/settings",
		icon: <SettingsIcon fill="#FFFFFF" />,
		iconActive: <SettingsIcon fill="#344E41" />,
		title: "Settings",
	},
	{
		href: null,
		icon: <LogoutIcon fill="#FFFFFF" />,
		iconActive: <LogoutIcon fill="#344E41" />,
		title: "Logout",
	},
] satisfies MenuItem[];
