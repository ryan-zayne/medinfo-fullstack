import { DashboardLayoutShared } from "../../-components/DashboardLayoutShared";
import { HeaderShared } from "../../-components/HeaderShared";
import { SidebarShared } from "../../-components/SidebarShared";
import { menuItems } from "./sidebar-links";

function PatientDashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<DashboardLayoutShared
			header={<HeaderShared menuItems={menuItems} variant="patient" />}
			sidebar={<SidebarShared menuItems={menuItems} />}
		>
			{children}
		</DashboardLayoutShared>
	);
}

export default PatientDashboardLayout;
