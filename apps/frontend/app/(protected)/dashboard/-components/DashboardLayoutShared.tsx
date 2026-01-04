"use client";

import { Logo } from "@/components/common";
import EmojiHandIcon from "@/components/icons/EmojiHandIcon";
import LogoutIcon from "@/components/icons/LogoutIcon";
import { HeaderShared, type MenuItem } from "./HeaderShared";
import { SidebarShared } from "./SidebarShared";

type DashboardLayoutProps = {
	children: React.ReactNode;
	menuItems: MenuItem[];
};

function DashboardLayoutShared(props: DashboardLayoutProps) {
	const { children, menuItems } = props;

	return (
		<div className="flex h-full lg:bg-medinfo-light-4">
			<aside
				className="hidden py-8 lg:sticky lg:top-0 lg:flex lg:h-screen lg:max-h-[832px] lg:w-[220px]
					lg:shrink-0 lg:flex-col lg:gap-12 lg:bg-white lg:shadow-md"
			>
				<Logo className="mx-auto" />

				<div className="flex h-full flex-col justify-between">
					<SidebarShared menuItems={menuItems} />

					<hr className="w-full px-6" />

					<div className="flex flex-col gap-8 px-6">
						<div className="flex items-center gap-0.5">
							<h1 className="text-[18px]">Hello, John</h1>
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
				<HeaderShared menuItems={menuItems} />
				{children}
			</main>
		</div>
	);
}

export { DashboardLayoutShared };
