"use client";

import { useState } from "react";
import ArrowBackIcon from "@/components/icons/ArrowBackIcon";
import Image from "next/image";
import MessageImage from "@/public/assets/images/message.png";
import ViewIcon from "@/components/icons/ViewIcon";
import CommentIcon from "@/components/icons/CommentIcon";
import { Button } from "@/components/ui";
import NextIcon from "@/components/icons/NextIcon";
import { useRouter } from "next/navigation";

export default function Page({ params }: { params: { slug: string } }) {
	const [showComments, setShowComments] = useState(false);
	const router = useRouter();

	const toggleComments = () => {
		setShowComments((prev) => !prev);
	};

	const handleBackClick = () => {
		router.push("/patient/community");
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
				<div className="flex gap-[12px]">
					<Image src={MessageImage} alt="profile" className="size-[48px]" />
					<div>
						<h2 className="text-[20px]">{params.slug}</h2>
						<div className="flex">
							<p className="font-normal text-medinfo-dark-3">by Ezra </p>
							<p> - Feb 11</p>
						</div>
					</div>
				</div>
				<div className="mt-[16px]">
					<p className="font-normal">
						Lorem ipsum dolor sit amet consectetur. At venenatis ornare ac facilisis odio non. Vel
						vitae posuere at scelerisque nullam. Neque odio aenean congue egestas. In felis tortor
						scelerisque ut nam consectetur faucibus est. Tortor amet sagittis sed tortor sed et
						tellus. Eu lobortis aliquet dis vitae sed amet.
					</p>
					<p className="mt-[16px] text-[14px] font-normal text-medinfo-dark-3">
						Three specialized doctors have interacted with this post
					</p>
				</div>
				<div className="mt-[20px] flex flex-col items-start space-y-[5.5px]">
					<div className="flex items-center gap-[6px]">
						<div className="flex items-center gap-[4px]">
							<ViewIcon />
							<p className="font-normal">13 views</p>
						</div>

						<div className="flex items-center gap-[4px]" onClick={toggleComments}>
							<CommentIcon />
							<p className="font-normal">32 comments</p>
						</div>
					</div>
					{showComments && (
						<div className="w-full">
							<div className="mt-[20px] border-t border-medinfo-light-1">
								<div
									className="mt-[20px] flex w-full flex-col space-y-[20px] lg:flex-row
										lg:items-center lg:gap-[40px] lg:space-y-0"
								>
									<p className="flex lg:hidden">Comments (32)</p>

									<div className="flex flex-1 gap-[12px]">
										<Image src={MessageImage} alt="profile" className="size-[48px]" />
										<input
											type="text"
											placeholder="add a comment"
											className="h-[48px] w-full rounded-[8px] border-2 border-solid
												border-medinfo-primary-main px-4 focus:outline-hidden lg:h-[64px]"
										/>
									</div>
									<Button
										className="w-full max-w-[159px] font-normal lg:max-w-[203px] lg:flex-1
											lg:text-[20px]"
									>
										Add comment
									</Button>
								</div>
								<p className="mt-[20px] hidden lg:flex">Comments (32)</p>
								<div className="mt-[20px] space-y-[20px]">
									<div>
										<div className="flex gap-[12px]">
											<Image src={MessageImage} alt="profile" className="size-[48px]" />
											<div className="space-y-[8px]">
												<h2 className="text-[16px] font-medium">Dr Nelson.O</h2>
												<p className="text-medinfo-dark-3">Feb 11</p>
											</div>
										</div>
										<p className="mt-[12px] font-normal">
											Lorem ipsum dolor sit amet consectetur. At venenatis ornare ac facilisis
											odio non. Vel vitae posuere at scelerisque nullam...
										</p>
									</div>

									<div>
										<div className="flex gap-[12px]">
											<Image src={MessageImage} alt="profile" className="size-[48px]" />
											<div className="space-y-[8px]">
												<h2 className="text-[16px] font-medium">Dr Nelson.O</h2>
												<p className="text-medinfo-dark-3">Feb 11</p>
											</div>
										</div>
										<p className="mt-[12px] font-normal">
											Lorem ipsum dolor sit amet consectetur. At venenatis ornare ac facilisis
											odio non. Vel vitae posuere at scelerisque nullam...
										</p>
									</div>
								</div>
								<div className="mt-[32px] flex items-center gap-[16px]">
									<p className="font-medium lg:text-[20px]">See all</p>
									<NextIcon />
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
