"use client";

import { useMutation } from "@tanstack/react-query";
import { isString } from "@zayne-labs/toolkit-type-helpers";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { CollapsibleAnimated } from "@/components/animated/ui";
import { For, ForWithWrapper, IconBox, Logo, NavLink } from "@/components/common";
import EmojiHandIcon from "@/components/icons/EmojiHandIcon";
import LogoutIcon from "@/components/icons/LogoutIcon";
import { Button, Drawer } from "@/components/ui";
import { redirectTo } from "@/lib/api/callBackendApi/plugins/utils/common";
import { signoutMutation } from "@/lib/react-query/mutationOptions";
import type { SessionQueryResultType } from "@/lib/react-query/queryOptions";
import { cnJoin, cnMerge } from "@/lib/utils/cn";
import type { MenuItem } from "./HeaderShared";

type SidebarProps = {
	className?: string;
	menuItems: MenuItem[];
	sessionQueryData: SessionQueryResultType | undefined;
};

export function SidebarShared(props: SidebarProps) {
	const { className, menuItems, sessionQueryData } = props;

	const pathname = usePathname();

	const signoutMutationResult = useMutation(signoutMutation());

	const onSignout = () => {
		signoutMutationResult.mutate(undefined, {
			onSuccess: () => redirectTo("/"),
		});
	};

	return (
		// NOTE - Using the trapFocus prop as a hack to prevent radix within vaul from trapping focus like a massive idiot🙂
		<Drawer.Root direction="left" trapFocus={false} modal={false} open={true} dismissible={false}>
			<aside
				className={cnMerge(
					// NOTE - These classes allow the sidebar to scroll only within itself.
					"sticky top-0 flex h-svh overflow-y-auto",

					"custom-scrollbar w-[240px] shrink-0",

					className
				)}
			>
				<Drawer.Header className="sr-only">
					<Drawer.Title>Dashboard Sidebar</Drawer.Title>
					<Drawer.Description>Dashboard Sidebar</Drawer.Description>
				</Drawer.Header>

				<Drawer.Content
					withHandle={false}
					withPortal={false}
					className={cnJoin(
						// NOTE - These classes allow the sidebar to scroll only within itself
						"absolute w-full grow",

						`h-fit border-none bg-white pt-8 pb-9 font-medium
						shadow-[2px_0_4px_theme(--color-medinfo-primary-main/0.12)] outline-hidden
						data-vaul-drawer:animation-duration-[1300ms]`
					)}
				>
					<Logo className="mx-auto" />

					<ForWithWrapper
						as="nav"
						each={menuItems}
						className="mt-12 flex flex-col gap-1"
						renderItem={(item) => {
							const isActive =
								pathname === item.href
								|| Boolean(item.children?.some((child) => pathname === child.href));

							return (
								<Fragment key={item.title}>
									{isString(item.href) && (
										<NavLink
											href={item.href}
											data-active={isActive}
											className={cnJoin(
												`flex h-[58px] items-center px-6 text-[18px] transition-colors
												data-[active=false]:text-medinfo-body-color
												data-[active=false]:hover:bg-medinfo-primary-subtle/50
												data-[active=false]:hover:shadow-[0_1px_theme(--color-medinfo-dark-3)]
												data-[active=true]:bg-medinfo-primary-main
												data-[active=true]:text-white`
											)}
										>
											{isActive ? item.icon : item.iconActive}
											<span className="ml-4 font-normal">{item.title}</span>
										</NavLink>
									)}

									{item.children && (
										<CollapsibleAnimated.Root
											defaultOpen={isActive}
											className="group/collapsible"
										>
											<CollapsibleAnimated.Trigger
												className={cnJoin(
													`h-[58px] gap-2 px-6 text-[18px] transition-colors
													hover:bg-medinfo-primary-subtle/50
													hover:shadow-[0_1px_theme(--color-medinfo-dark-3)]`,
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
											</CollapsibleAnimated.Trigger>

											<CollapsibleAnimated.Content
												className="flex flex-col gap-3 px-3 *:first:mt-3"
											>
												<For
													each={item.children}
													renderItem={(childItem) => (
														<NavLink
															key={childItem.title}
															href={childItem.href}
															className={cnJoin(
																`flex h-10 items-center rounded-[8px] border
																border-gray-200 px-4 text-[14px] font-medium text-nowrap
																text-medinfo-body-color transition-all
																hover:border-medinfo-primary-main
																hover:text-medinfo-primary-main
																data-[active=true]:border-medinfo-primary-main
																data-[active=true]:bg-medinfo-primary-main
																data-[active=true]:text-white`
															)}
														>
															{childItem.title}
														</NavLink>
													)}
												/>
											</CollapsibleAnimated.Content>
										</CollapsibleAnimated.Root>
									)}
								</Fragment>
							);
						}}
					/>

					<hr className="mx-4 my-12 border-medinfo-light-1" />

					<div className="flex items-center gap-1.5 p-4">
						<p className="text-[18px]">Hello, {sessionQueryData?.data.user.firstName}</p>
						<EmojiHandIcon />
					</div>

					<div className="mt-3 flex items-center gap-3 bg-medinfo-primary-subtle p-4">
						<IconBox icon="iconoir:badge-check" className="size-5" />
						<p className="text-[18px]">Go Premium</p>
					</div>

					<Button
						unstyled={true}
						loadingStyle="side-by-side"
						isLoading={signoutMutationResult.isPending}
						disabled={signoutMutationResult.isPending}
						className="mt-8 flex items-center gap-3 p-4"
						onClick={onSignout}
					>
						<LogoutIcon />
						Logout
					</Button>
				</Drawer.Content>
			</aside>
		</Drawer.Root>
	);
}
