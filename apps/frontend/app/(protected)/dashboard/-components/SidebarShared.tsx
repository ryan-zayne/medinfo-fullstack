"use client";

import { isString } from "@zayne-labs/toolkit-type-helpers";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import * as Collapsible from "@/components/animated/ui/collapsible";
import { For, ForWithWrapper, IconBox, NavLink } from "@/components/common";
import { cnJoin } from "@/lib/utils/cn";
import type { MenuItem } from "./HeaderShared";

type SidebarProps = {
	menuItems: MenuItem[];
};

export function SidebarShared({ menuItems }: SidebarProps) {
	const pathname = usePathname();

	return (
		<ForWithWrapper
			as="nav"
			each={menuItems}
			className="mt-2 flex flex-col gap-1"
			renderItem={(item) => {
				const isActive =
					pathname === item.href || item.children?.some((child) => pathname === child.href);

				return (
					<Fragment key={item.title}>
						{isString(item.href) && (
							<NavLink
								href={item.href}
								data-active={isActive}
								className={cnJoin(
									`flex h-[58px] items-center px-6 text-[18px]
									data-[active=false]:text-medinfo-body-color data-[active=false]:hover:border-b-2
									data-[active=false]:hover:border-medinfo-dark-3
									data-[active=false]:hover:bg-[#F0FDF6]/80
									data-[active=true]:bg-medinfo-primary-main data-[active=true]:text-white`
								)}
							>
								{isActive ? item.icon : item.iconActive}
								<span className="ml-4 font-normal">{item.title}</span>
							</NavLink>
						)}

						{item.children && (
							<Collapsible.Root defaultOpen={isActive} className="group/collapsible">
								<Collapsible.Trigger
									className={cnJoin(
										`flex h-[58px] items-center justify-between gap-1 px-6 text-[18px]
										text-medinfo-body-color transition-colors hover:bg-[#F0FDF6]/80`,
										isActive && "font-medium text-medinfo-primary-main"
									)}
								>
									<div className="flex items-center">
										{item.iconActive}
										<span className="ml-4 text-nowrap">{item.title}</span>
									</div>

									<IconBox
										icon="lucide:chevron-right"
										className="size-5 shrink-0 transition-transform duration-200
											group-data-[state=open]/collapsible:rotate-90"
									/>
								</Collapsible.Trigger>

								<Collapsible.Content className="flex flex-col gap-3 *:first:mt-3">
									<For
										each={item.children}
										renderItem={(childItem) => (
											<NavLink
												key={childItem.title}
												href={childItem.href}
												className={cnJoin(
													`mr-4 ml-10 flex h-10 items-center rounded-[8px] border
													border-gray-200 pl-4 text-[14px] font-medium text-nowrap
													text-medinfo-body-color transition-all
													hover:border-medinfo-primary-main hover:text-medinfo-primary-main
													data-[active=true]:border-medinfo-primary-main
													data-[active=true]:bg-medinfo-primary-main
													data-[active=true]:text-white`
												)}
											>
												{childItem.title}
											</NavLink>
										)}
									/>
								</Collapsible.Content>
							</Collapsible.Root>
						)}
					</Fragment>
				);
			}}
		/>
	);
}
