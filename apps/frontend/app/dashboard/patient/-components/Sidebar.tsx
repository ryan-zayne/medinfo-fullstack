"use client";

import { cnJoin } from "@/lib/utils/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "./SidebarLinks";

// TODO: Open dropdown if dropdown item is active, show active state for dropdown if dropdown item is active, state should persist when closed
const Sidebar = () => {
	const pathname = usePathname();

	return (
		<nav className="text-center">
			<ul className="mt-[8px] leading-[4rem]">
				{menuItems.map(({ href, icon: Icon, title }) => {
					const isActive = pathname === href;
					const iconFill = { fill: isActive ? "#FFFFFF" : "#344E41" };
					return (
						<li className="text-[18px]" key={title}>
							<Link
								href={href}
								className={cnJoin("flex h-[58px] items-center px-6", {
									"bg-medinfo-primary-main text-white": isActive,
									"text-black hover:border-b-2 hover:border-medinfo-dark-3 hover:bg-[#F0FDF6]/80":
										!isActive,
								})}
							>
								<Icon style={iconFill} />
								<span className="ml-4 font-normal">{title}</span>
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
};

export default Sidebar;
