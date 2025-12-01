import { Logo, NavLink } from "@/components/common";
import LogoutIcon from "@/components/icons/LogoutIcon";
import { cnMerge } from "@/lib/utils/cn";
import type { MenuItem } from "./HeaderShared";

type MobileNavProps = {
	className?: string;
	isNavShow: boolean;
	menuItems: MenuItem[];
	toggleNavShow: () => void;
};

function MobileNavigation(props: MobileNavProps) {
	const { className, isNavShow, menuItems, toggleNavShow } = props;

	return (
		<article
			className={cnMerge(
				`fixed inset-[0_0_0_auto] flex flex-col items-center gap-7 overflow-hidden
				bg-medinfo-primary-main pt-10 text-white`,
				isNavShow ? "w-full [transition:width_350ms_ease]" : "w-0 [transition:width_500ms_ease]",
				className
			)}
			onClick={(event) => {
				const element = event.target as HTMLElement;

				element.tagName === "A" && toggleNavShow();
			}}
		>
			<Logo type="footer" className="h-[46px] w-[60px]" />

			<nav
				className="mt-[32px] flex flex-col justify-start gap-5 font-medium text-nowrap lg:text-[22px]"
			>
				{menuItems.map(({ href, icon, title }) => (
					<NavLink
						key={href}
						transitionType="navbar"
						href={href}
						className="flex items-center gap-[16px]"
					>
						{icon}
						{title}
					</NavLink>
				))}
				<NavLink transitionType="navbar" href="/" className="mt-[32px] flex items-center gap-[16px]">
					<LogoutIcon className="fill-white" />
					Log out
				</NavLink>
			</nav>
		</article>
	);
}

export default MobileNavigation;
