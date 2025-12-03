import { DashboardLayoutShared } from "../../-components/DashboardLayoutShared";
import { HeaderShared } from "../../-components/HeaderShared";
import { SidebarShared } from "../../-components/SidebarShared";
import { menuItems } from "./sidebar-links";

function DoctorDashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<DashboardLayoutShared
			header={<HeaderShared menuItems={menuItems} variant="doctor" />}
			sidebar={<SidebarShared menuItems={menuItems} />}
		>
			{children}
		</DashboardLayoutShared>
	);
}

export default DoctorDashboardLayout;
