"use client";

import { useQuery } from "@tanstack/react-query";
import { sessionQuery } from "@/lib/react-query/queryOptions";
import { HeaderShared, type MenuItem } from "./HeaderShared";
import { SidebarShared } from "./SidebarShared";

type DashboardLayoutProps = {
	children: React.ReactNode;
	menuItems: MenuItem[];
};

function DashboardLayoutShared(props: DashboardLayoutProps) {
	const { children, menuItems } = props;

	const sessionQueryResult = useQuery(sessionQuery());

	return (
		<div className="flex grow lg:bg-medinfo-light-4">
			<SidebarShared
				className="max-lg:hidden"
				menuItems={menuItems}
				sessionQueryData={sessionQueryResult.data}
			/>

			<div className="flex w-full grow flex-col">
				<HeaderShared menuItems={menuItems} sessionQueryData={sessionQueryResult.data} />
				{children}
			</div>
		</div>
	);
}

export { DashboardLayoutShared };
