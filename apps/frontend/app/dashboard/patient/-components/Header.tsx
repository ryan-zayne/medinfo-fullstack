"use client";

import { Logo } from "@/components/common";
import { HamburgerIcon, NotificationIcon, SearchIcon, XIcon } from "@/components/icons";
import { Button } from "@/components/ui";
import { capitalize } from "@/lib/utils";
import { useToggle } from "@zayne-labs/toolkit-react";
import { usePathname } from "next/navigation";
import MobileNavigation from "./MobileNavigation";
import { menuItems } from "./SidebarLinks";

const Header = () => {
	const pathName = usePathname();
	const [isNavShow, toggleNavShow] = useToggle(false);

	const activePath = capitalize(pathName.split("/").at(-1));

	const activeTitle = menuItems.find((menuItem) => menuItem.href === pathName)?.title ?? activePath;

	return (
		<>
			{/* desktop view */}
			<header
				className="sticky top-0 z-10 hidden items-center justify-between bg-white px-[40px] py-[16px]
					shadow-md lg:flex"
			>
				<div className="text-[32px] font-semibold">{activeTitle}</div>
				<div className="relative items-center space-x-4">
					<SearchIcon type="green" className="absolute top-2 left-8" />
					<input
						type="text"
						placeholder="search"
						className="w-[400px] rounded-[8px] border border-medinfo-primary-main px-12 py-2
							text-[#414141]"
					/>
				</div>
				<div className="flex items-center space-x-[40px]">
					<NotificationIcon />
					<div className="size-[40px] rounded-full bg-gray-500" />
				</div>
			</header>
			{/* mobile view  */}
			<header
				className="sticky top-0 z-10 flex items-center justify-between bg-white px-[24px] py-[17px]
					shadow-md lg:hidden"
			>
				<Logo className="h-[46px] w-[60px]" />
				<div className="text-[18px] font-semibold">{activeTitle}</div>
				<div className="flex items-center gap-[16px]">
					<SearchIcon type="green" />
					<NotificationIcon />
					<Button unstyled={true} className="z-10" onClick={toggleNavShow}>
						{isNavShow ?
							<XIcon />
						:	<HamburgerIcon />}
					</Button>
					<MobileNavigation isNavShow={isNavShow} toggleNavShow={toggleNavShow} />
				</div>
			</header>
		</>
	);
};

export default Header;
