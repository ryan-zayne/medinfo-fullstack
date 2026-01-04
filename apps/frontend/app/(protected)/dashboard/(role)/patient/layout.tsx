import { DashboardLayoutShared } from "../../-components/DashboardLayoutShared";
import { menuItems } from "./sidebar-links";

function PatientDashboardLayout({ children }: LayoutProps<"/dashboard/patient">) {
	return <DashboardLayoutShared menuItems={menuItems}>{children}</DashboardLayoutShared>;
}

export default PatientDashboardLayout;
