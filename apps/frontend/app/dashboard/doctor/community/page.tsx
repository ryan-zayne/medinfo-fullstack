"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import MessageImage from "@/public/assets/images/message.png";
import ViewIcon from "@/components/icons/ViewIcon";
import CommentIcon from "@/components/icons/CommentIcon";

function Page() {
	const router = useRouter();

	const handleNavigation = (slug: string) => {
		router.push(`/doctor/community/${slug}`);
	};

	return (
		<div className="px-[28px] py-[56px] lg:p-[40px]">
			<div className="gap-[32px] rounded-[16px] bg-white p-[16px] shadow-md lg:p-[32px]">
				<div className="space-y-[12px] lg:w-full lg:max-w-[661.8px]">
					<div
						className="flex cursor-pointer flex-col gap-[16px] rounded-[8px] border border-solid
							border-medinfo-light-1 p-[16px] lg:flex-row lg:justify-between"
						onClick={() => handleNavigation("Malaria-parasites")}
					>
						<div className="flex gap-[12px]">
							<Image src={MessageImage} alt="profile" className="size-[48px]" />
							<div>
								<h2 className="text-[20px]">Malaria parasites</h2>

								<p className="font-normal text-medinfo-dark-3">
									Lorem ipsum dolor sit amet consectetur. Eget vivamus.
								</p>
							</div>
						</div>
						<div className="hidden flex-col space-y-[5.5px] lg:flex">
							<div className="flex items-center justify-end gap-[4px]">
								<ViewIcon />
								<p className="text-[14px] font-normal text-medinfo-dark-3">13 views</p>
							</div>
							<p className="rounded-[24px] bg-[#06C270] p-[6px] text-[12px] font-normal text-white">
								2 new comments
							</p>
							<div className="flex items-center gap-[4px]">
								<CommentIcon />
								<p className="text-[14px] font-normal text-medinfo-dark-3">32 comments</p>
							</div>
						</div>
						<div className="flex flex-col items-start space-y-[5.5px] lg:hidden">
							<p className="rounded-[24px] bg-[#06C270] p-[6px] text-[12px] font-normal text-white">
								2 new comments
							</p>
							<div className="flex items-center gap-[6px]">
								<div className="flex items-center gap-[4px]">
									<ViewIcon />
									<p className="text-[14px] font-normal text-medinfo-dark-3">13 views</p>
								</div>

								<div className="flex items-center gap-[4px]">
									<CommentIcon />
									<p className="text-[14px] font-normal text-medinfo-dark-3">32 comments</p>
								</div>
							</div>
						</div>
					</div>
					<div
						className="flex cursor-pointer flex-col gap-[16px] rounded-[8px] border border-solid
							border-medinfo-light-1 p-[16px] lg:flex-row lg:justify-between"
						onClick={() => handleNavigation("Typhoid")}
					>
						<div className="flex gap-[12px]">
							<Image src={MessageImage} alt="profile" className="size-[48px]" />
							<div>
								<h2 className="text-[20px]">Typhoid</h2>
								<p className="font-normal text-medinfo-dark-3">
									Lorem ipsum dolor sit amet consectetur. Eget vivamus.
								</p>
							</div>
						</div>
						<div className="hidden flex-col space-y-[5.5px] lg:flex">
							<div className="flex items-center justify-end gap-[4px]">
								<ViewIcon />
								<p className="text-[14px] font-normal text-medinfo-dark-3">13 views</p>
							</div>
							<div className="rounded-[24px] bg-[#06C270] p-[6px] text-white">
								<p className="text-[12px] font-normal text-white">2 new comments</p>
							</div>
							<div className="flex items-center gap-[4px]">
								<CommentIcon />
								<p className="text-[14px] font-normal text-medinfo-dark-3">32 comments</p>
							</div>
						</div>
						<div className="flex flex-col items-start space-y-[5.5px] lg:hidden">
							<p className="rounded-[24px] bg-[#06C270] p-[6px] text-[12px] font-normal text-white">
								2 new comments
							</p>
							<div className="flex items-center gap-[6px]">
								<div className="flex items-center gap-[4px]">
									<ViewIcon />
									<p className="text-[14px] font-normal text-medinfo-dark-3">13 views</p>
								</div>

								<div className="flex items-center gap-[4px]">
									<CommentIcon />
									<p className="text-[14px] font-normal text-medinfo-dark-3">32 comments</p>
								</div>
							</div>
						</div>
					</div>
					<p
						className="mt-[32px] text-right text-[16px] font-medium text-medinfo-primary-main
							lg:text-left lg:text-[20px]"
					>
						See more
					</p>
				</div>
			</div>
		</div>
	);
}

export default Page;
