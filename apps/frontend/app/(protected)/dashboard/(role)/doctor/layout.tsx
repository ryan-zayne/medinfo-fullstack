import { DashboardLayoutShared } from "../../-components/DashboardLayoutShared";
import { menuItems } from "./sidebar-links";

function DoctorDashboardLayout({ children }: LayoutProps<"/dashboard/doctor">) {
	return <DashboardLayoutShared menuItems={menuItems}>{children}</DashboardLayoutShared>;
}

export default DoctorDashboardLayout;
