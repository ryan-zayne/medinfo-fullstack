import { SearchIcon } from "@/components/icons";

function page() {
	return (
		<div className="-z-10 mt-[56px] px-[24px] lg:z-10 lg:mt-0 lg:p-[40px]">
			<div className="flex h-[680px] gap-[28px]">
				<div
					className="w-full rounded-[16px] border border-solid border-medinfo-primary-lighter bg-white
						py-[20px] lg:max-w-[274px]"
				>
					<div
						className="relative mx-[12px] items-center space-x-4 rounded-[8px] border
							border-medinfo-primary-lighter px-[16px] py-[14px] lg:w-[251px]"
					>
						<SearchIcon type="green" className="absolute top-4 left-4" />
						<input type="text" placeholder="search for a chat" className="bg-none pl-[16px]" />
					</div>
					<div className="mt-[20px]">
						<div className="flex justify-between border border-solid p-[11px]">
							<div className="flex gap-[8px]">
								<div
									className="relative size-[48px] rounded-full border-[1.4px]
										border-medinfo-primary-main bg-gray-300 lg:size-[48px]"
								>
									<div className="absolute top-[2px] right-1">
										<div className="size-[8px] rounded-full bg-[#05A660]" />
									</div>
								</div>
								<div>
									<h2 className="text-[18px]">Jay Jay</h2>
									<p className="text-[14px]">You can check t...</p>
								</div>
							</div>
							<p className="text-[12px]">12:00</p>
						</div>
						<div className="flex justify-between border border-solid p-[11px]">
							<div className="flex gap-[8px]">
								<div
									className="relative size-[48px] rounded-full border-[1.4px]
										border-medinfo-primary-main bg-gray-300 lg:size-[48px]"
								>
									<div className="absolute top-[2px] right-1">
										<div className="size-[8px] rounded-full bg-[#05A660]" />
									</div>
								</div>
								<div>
									<h2 className="text-[18px]">Mary Doe</h2>
									<p className="text-[14px]">You can check t...</p>
								</div>
							</div>
							<p className="text-[12px]">12:00</p>
						</div>
					</div>
				</div>

				<div
					className="hidden w-full rounded-[16px] border border-solid border-medinfo-primary-lighter
						bg-white lg:flex"
				/>
			</div>
		</div>
	);
}

export default page;
