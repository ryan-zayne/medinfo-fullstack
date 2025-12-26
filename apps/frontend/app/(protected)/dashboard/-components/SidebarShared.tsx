"use client";

import { usePathname } from "next/navigation";
import { ForWithWrapper, NavLink } from "@/components/common";
import { cnJoin } from "@/lib/utils/cn";
import type { MenuItem } from "./HeaderShared";

type SidebarProps = {
	menuItems: MenuItem[];
};

function SidebarShared({ menuItems }: SidebarProps) {
	const pathname = usePathname();

	return (
		<ForWithWrapper
			as="nav"
			each={menuItems}
			className="mt-2"
			renderItem={(item) => {
				const isActive = pathname === item.href;

				return (
					<NavLink
						key={item.title}
						href={item.href}
						className={cnJoin(
							"flex h-[58px] items-center px-6 text-[18px]",
							isActive ?
								"bg-medinfo-primary-main text-white"
							:	"text-black hover:border-b-2 hover:border-medinfo-dark-3 hover:bg-[#F0FDF6]/80"
						)}
					>
						{isActive ? item.icon : item.iconActive}
						<span className="ml-4 font-normal">{item.title}</span>
					</NavLink>
				);
			}}
		/>
	);
}

export { SidebarShared };
