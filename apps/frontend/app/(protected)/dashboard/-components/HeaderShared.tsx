"use client";

import { useToggle } from "@zayne-labs/toolkit-react";
import { isString, type UnionDiscriminator } from "@zayne-labs/toolkit-type-helpers";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { AvatarGroupAnimated } from "@/components/animated/ui";
import * as Collapsible from "@/components/animated/ui/collapsible";
import { For, ForWithWrapper, IconBox, Logo, NavLink } from "@/components/common";
import type { MainAppRoutes } from "@/components/common/NavLink";
import { HamburgerIcon, NotificationIcon, SearchIcon, XIcon } from "@/components/icons";
import { Avatar, Button, Form } from "@/components/ui";
import type { SessionQueryResultType } from "@/lib/react-query/queryOptions";
import { capitalize } from "@/lib/utils";
import { cnMerge } from "@/lib/utils/cn";

export type MenuItem = UnionDiscriminator<
	[
		{
			children: Array<{ href: MainAppRoutes; title: string }>;
			icon: React.ReactNode;
			iconActive: React.ReactNode;
			title: string;
		},
		{
			href: MainAppRoutes;
			icon: React.ReactNode;
			iconActive: React.ReactNode;
			title: string;
		},
		{
			href: null;
			icon: React.ReactNode;
			iconActive: React.ReactNode;
			title: string;
		},
	]
>;

type HeaderProps = {
	menuItems: MenuItem[];
	sessionQueryData: SessionQueryResultType | undefined;
};

function HeaderShared(props: HeaderProps) {
	const { menuItems, sessionQueryData } = props;
	const pathName = usePathname();

	const activePath = capitalize(pathName.split("/").at(-1));
	const activeTitle = menuItems.find((menuItem) => menuItem.href === pathName)?.title ?? activePath;

	return (
		<>
			<DesktopHeader
				sessionQueryData={sessionQueryData}
				activeTitle={activeTitle}
				className="max-lg:hidden"
			/>

			<MobileHeader activeTitle={activeTitle} menuItems={menuItems} className="lg:hidden" />
		</>
	);
}

export { HeaderShared };

type DesktopHeaderProps = {
	activeTitle: string | undefined;
	className?: string;
	sessionQueryData: SessionQueryResultType | undefined;
};

function DesktopHeader(props: DesktopHeaderProps) {
	const { activeTitle, className, sessionQueryData } = props;

	return (
		<header
			className={cnMerge(
				"sticky top-0 z-50 flex items-center justify-between bg-white px-10 py-4 shadow-md",
				className
			)}
		>
			<p className="text-[32px] font-semibold">{activeTitle}</p>

			<Form.InputGroup
				className="w-[400px] rounded-[8px] border border-medinfo-primary-main px-6 py-2
					text-medinfo-body-color"
			>
				<Form.InputLeftItem>
					<SearchIcon variant="green" />
				</Form.InputLeftItem>

				<Form.InputPrimitive placeholder="search" />
			</Form.InputGroup>

			<div className="flex items-center space-x-10">
				<NotificationIcon />
				<AvatarGroupAnimated.Root className="space-x-0" translate="5%">
					<Avatar.Root className="size-14 rounded-full border border-medinfo-light-2">
						<Avatar.Image
							src={sessionQueryData?.data.user.avatar}
							alt={sessionQueryData?.data.user.fullName}
						/>
						<Avatar.Fallback
							className="bg-medinfo-secondary-main text-lg font-bold text-medinfo-primary-darker"
						>
							{sessionQueryData?.data.user.firstName[0]}
							{sessionQueryData?.data.user.lastName[0]}
						</Avatar.Fallback>

						<AvatarGroupAnimated.Tooltip
							classNames={{ base: "bg-medinfo-primary-darker text-white" }}
						>
							{sessionQueryData?.data.user.fullName}
						</AvatarGroupAnimated.Tooltip>
					</Avatar.Root>
				</AvatarGroupAnimated.Root>
			</div>
		</header>
	);
}

type MobileHeaderProps = Pick<DesktopHeaderProps, "activeTitle" | "className"> & {
	menuItems: MenuItem[];
};

function MobileHeader(props: MobileHeaderProps) {
	const { activeTitle, className, menuItems } = props;

	const [isNavShow, toggleNavShow] = useToggle(false);

	const pathname = usePathname();

	return (
		<header
			className={cnMerge(
				"sticky top-0 z-10 flex items-center justify-between bg-white px-6 py-[17px] shadow-md",
				className
			)}
		>
			<Logo className="h-[46px] w-[60px]" />

			<p className="text-[18px] font-semibold">{activeTitle}</p>

			<div className="flex items-center gap-4">
				<SearchIcon variant="green" />

				<NotificationIcon />

				<Button unstyled={true} className="z-10" onClick={toggleNavShow}>
					{isNavShow ?
						<XIcon />
					:	<HamburgerIcon />}
				</Button>

				<article
					className={cnMerge(
						`fixed inset-[0_0_0_auto] flex flex-col items-center gap-7 overflow-x-hidden
						overflow-y-auto bg-medinfo-primary-main pt-10 text-white`,
						isNavShow ? "w-full [transition:width_350ms_ease]" : "w-0 [transition:width_500ms_ease]"
					)}
					onClick={(event) => {
						const element = event.target as HTMLElement;

						element.tagName === "A" && toggleNavShow();
					}}
				>
					<Logo variant="footer" className="h-[46px] w-[60px]" />

					<ForWithWrapper
						each={menuItems}
						as="nav"
						className="mt-8 flex w-full max-w-[300px] flex-col gap-2 px-6 font-medium text-nowrap
							lg:text-[22px]"
						renderItem={(item) => (
							<Fragment key={item.title}>
								{isString(item.href) && (
									<NavLink
										transitionType="navbar"
										href={item.href}
										className="flex items-center gap-4 py-2"
									>
										{item.icon}
										{item.title}
									</NavLink>
								)}

								{item.children && (
									<Collapsible.Root
										className="group/collapsible"
										defaultOpen={item.children.some((child) => child.href === pathname)}
									>
										<Collapsible.Trigger
											className="flex w-full items-center justify-between gap-1 py-2 text-left"
										>
											<div className="flex items-center gap-4">
												{item.icon}
												{item.title}
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
												renderItem={(child) => (
													<NavLink
														key={child.href}
														href={child.href}
														className={cnMerge(
															`ml-10 flex h-10 items-center rounded-lg border
															border-white/60 pl-4 text-[16px] text-white/80
															transition-colors hover:border-white hover:text-white
															data-[active=true]:border-white data-[active=true]:bg-white
															data-[active=true]:font-bold
															data-[active=true]:text-medinfo-primary-main`
														)}
													>
														{child.title}
													</NavLink>
												)}
											/>
										</Collapsible.Content>
									</Collapsible.Root>
								)}

								{item.href === null && (
									<NavLink
										transitionType="navbar"
										href="#"
										onClick={() => {}}
										className="flex w-fit items-center gap-4 py-2"
									>
										{item.icon}
										{item.title}
									</NavLink>
								)}
							</Fragment>
						)}
					/>
				</article>
			</div>
		</header>
	);
}
