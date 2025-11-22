"use client";

import { Logo } from "@/components/common";
import EmojiHandIcon from "@/components/icons/EmojiHandIcon";
import LogoutIcon from "@/components/icons/LogoutIcon";
import Header from "./-components/Header";
import Sidebar from "./-components/Sidebar";

function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex h-full lg:bg-medinfo-light-4">
			<aside
				className="hidden py-8 lg:sticky lg:top-0 lg:flex lg:h-screen lg:max-h-[832px] lg:w-[220px]
					lg:shrink-0 lg:flex-col lg:gap-[48px] lg:bg-white lg:shadow-md"
			>
				<Logo className="mx-auto" />

				<div className="flex h-full flex-col justify-between">
					<Sidebar />
					<div className="px-6">
						<hr className="w-full" />
					</div>
					<div className="flex flex-col gap-8 px-6">
						<div className="flex items-center gap-[2px]">
							<h1 className="text-[18px]">Hello, John</h1>
							<span>
								<EmojiHandIcon />
							</span>
						</div>
						<div className="flex items-center gap-[12px]">
							<LogoutIcon fill="" />
							<h1 className="text-[18px] text-[#323232]">Log out</h1>
						</div>
					</div>
				</div>
			</aside>

			<main className="flex w-full flex-col">
				<Header />
				{children}
			</main>
		</div>
	);
}

export default DashboardLayout;
