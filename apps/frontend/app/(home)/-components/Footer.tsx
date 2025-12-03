import { IconBox, Logo } from "@/components/common";
import { CopyrightIcon } from "@/components/icons";

function Footer() {
	return (
		<footer
			className="flex w-full flex-col gap-[44px] bg-medinfo-primary-main px-6 py-10 text-white
				lg:flex-row lg:items-start lg:justify-between lg:px-[100px] lg:py-14"
		>
			<div className="mt-5 flex flex-col">
				<Logo type="footer" className="max-lg:h-[46px] max-lg:max-w-[60px]" />

				<div className="mt-5 flex items-center gap-[4px] text-[14px] text-white lg:text-base">
					<CopyrightIcon />
					<p>2023 MedInfo Nigeria. All rights reserved.</p>
				</div>
			</div>

			<div className="text-[18px]">
				<h3 className="text-[20px] text-medinfo-secondary-darker">Quick links</h3>

				<ul className="mt-6 grid gap-4">
					<li>About us</li>
					<li>FAQs</li>
					<li>Library</li>
				</ul>
			</div>

			<div className="text-[18px]">
				<h3 className="text-[20px] text-medinfo-secondary-darker">Contact us</h3>

				<ul className="mt-6 grid gap-4">
					<li className="flex items-center gap-3">
						<IconBox icon="bi:telephone" className="size-[22px]" />
						<p>+234 8123 456 789</p>
					</li>

					<li className="flex items-center gap-3">
						<IconBox icon="mynaui:envelope" className="size-[22px]" />
						<p>tezonteam@gmail.com</p>
					</li>

					<li className="flex gap-4">
						<IconBox icon="mynaui:brand-facebook" className="size-[22px]" />
						<IconBox icon="akar-icons:instagram-fill" className="size-[22px]" />
						<IconBox icon="lucide:linkedin" className="size-[22px]" />
					</li>
				</ul>
			</div>
		</footer>
	);
}

export default Footer;
