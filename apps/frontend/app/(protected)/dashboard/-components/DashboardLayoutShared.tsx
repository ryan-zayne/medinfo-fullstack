"use client";

import { useQuery } from "@tanstack/react-query";
import { Logo } from "@/components/common";
import EmojiHandIcon from "@/components/icons/EmojiHandIcon";
import LogoutIcon from "@/components/icons/LogoutIcon";
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
		<div className="flex h-full lg:bg-medinfo-light-4">
			<aside
				className="hidden py-8 lg:sticky lg:top-0 lg:flex lg:h-screen lg:max-h-208 lg:w-55 lg:shrink-0
					lg:flex-col lg:gap-12 lg:bg-white lg:shadow-md"
			>
				<Logo className="mx-auto" />

				<div className="flex h-full flex-col justify-between">
					<SidebarShared menuItems={menuItems} />

					<hr className="w-full px-6" />

					<div className="flex flex-col gap-8 px-6">
						<div className="flex items-center gap-0.5">
							<h1 className="text-[18px]">Hello, {sessionQueryResult.data?.data.user.firstName}</h1>
							<span>
								<EmojiHandIcon />
							</span>
						</div>

						<div className="flex items-center gap-3">
							<LogoutIcon fill="" />
							<h1 className="text-[18px] text-medinfo-body-color">Log out</h1>
						</div>
					</div>
				</div>
			</aside>

			<main className="flex w-full flex-col">
				<HeaderShared sessionQueryData={sessionQueryResult.data} menuItems={menuItems} />
				{children}
			</main>
		</div>
	);
}

export { DashboardLayoutShared };
