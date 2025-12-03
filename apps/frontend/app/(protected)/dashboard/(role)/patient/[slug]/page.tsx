"use client";

import ArrowBackIcon from "@/components/icons/ArrowBackIcon";
import WarningIcon from "@/components/icons/WarningIcon";
import { Button } from "@/components/ui";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Page({ params }: { params: { slug: string } }) {
	const decodedSlug = decodeURIComponent(params.slug);
	const router = useRouter();

	const handleBackClick = () => {
		router.push("/patient");
	};

	return (
		<div className="p-[24px] lg:p-[40px]">
			<div
				className="flex max-w-[48px] items-center rounded-[8px] border border-solid
					border-medinfo-light-1 bg-white p-[14px] lg:max-w-[64px] lg:p-[20px]"
				onClick={handleBackClick}
			>
				<ArrowBackIcon />
			</div>
			<div className="mt-[32px] rounded-[16px] bg-white p-[16px] shadow-md lg:p-[32px]">
				<div className="flex items-start gap-[12px] rounded-[8px]">
					<div className="size-[88px]">
						<Image
							src="/assets/images/dashboard/Frame 2609432.png"
							width={88}
							height={88}
							alt="product"
						/>
					</div>
					<div className="flex-1 space-y-[30px]">
						<h2 className="text-[18px] font-medium lg:text-[20px]">{decodedSlug}</h2>
						<p className="text-[14px] font-semibold text-medinfo-dark-1">$0 - $120</p>
					</div>
				</div>
				<hr className="mt-[32px] w-full border-[0.6px] border-medinfo-light-1" />
				<div
					className="mt-[32px] flex w-full max-w-[727px] flex-col items-center gap-[72px] lg:flex-row
						lg:items-end"
				>
					<div className="w-full max-w-[657px] space-y-[32px]">
						<div className="flex items-start justify-between">
							<div className="flex gap-[20px]">
								<div>
									<Image
										src="/assets/images/dashboard/avatar.svg"
										width={88}
										height={88}
										alt="avatar"
									/>
								</div>
								<div className="space-y-[30px]">
									<h2 className="text-[18px] font-semibold lg:text-[24px]">John Doe</h2>
									<p className="text-[14px] font-normal text-medinfo-dark-1 lg:text-[18px]">
										28 years old
									</p>
								</div>
							</div>
							<div>
								<h2 className="text-[20px] font-medium text-medinfo-primary-main">Change</h2>
							</div>
						</div>
						<div className="flex justify-between lg:items-center">
							<p className="text-medinfo-dark-1 lg:text-[18px]">
								Location: <br className="lg:hidden" />
								Awka, Anambra state, <br className="lg:hidden" />
								Nigeria
							</p>
							<h2 className="text-[20px] font-medium text-medinfo-primary-main">Change</h2>
						</div>
						<div className="flex justify-between">
							<h2 className="text-left text-medinfo-dark-1 lg:w-auto lg:text-[18px]">
								Do you have health insurance?
							</h2>
							<div className="space-y-[8px]">
								<div className="flex items-center space-x-[8px]">
									<input type="radio" name="" className="size-[20px] lg:size-[24px]" />
									<label className="text-[14px] lg:text-[16px]">Yes</label>
								</div>
								<div className="flex items-center space-x-[8px]">
									<input type="radio" name="" className="size-[20px] lg:size-[24px]" />
									<label className="text-[14px] lg:text-[16px]">No</label>
								</div>
							</div>
						</div>
						<div className="flex lg:items-center">
							<WarningIcon />
							<p className="text-[14px] text-medinfo-dark-3">
								You’ll be assigned a specialized doctor after payment
							</p>
						</div>
					</div>
					<div>
						<Button theme="primary" className="font-medium lg:text-[20px]">
							Pay
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
