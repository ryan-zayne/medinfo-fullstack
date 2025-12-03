import { SearchIcon } from "@/components/icons";

function MessagesPageShared() {
	return (
		<div className="-z-10 mt-[56px] flex h-[680px] gap-7 px-6 lg:z-10 lg:mt-0 lg:p-10">
			<div
				className="w-full rounded-[16px] border border-solid border-medinfo-primary-lighter bg-white
					py-5 lg:max-w-[274px]"
			>
				<div
					className="relative mx-3 items-center space-x-4 rounded-[8px] border
						border-medinfo-primary-lighter px-4 py-3.5 lg:w-[251px]"
				>
					<SearchIcon type="green" className="absolute top-4 left-4" />
					<input type="text" placeholder="search for a chat" className="bg-none pl-4" />
				</div>

				<div className="mt-5">
					<div className="flex justify-between border border-solid p-[11px]">
						<div className="flex gap-2">
							<div
								className="relative size-12 rounded-full border-[1.4px] border-medinfo-primary-main
									bg-gray-300 lg:size-12"
							>
								<div className="absolute top-0.5 right-1">
									<div className="size-2 rounded-full bg-[#05A660]" />
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
						<div className="flex gap-2">
							<div
								className="relative size-12 rounded-full border-[1.4px] border-medinfo-primary-main
									bg-gray-300 lg:size-12"
							>
								<div className="absolute top-0.5 right-1">
									<div className="size-2 rounded-full bg-[#05A660]" />
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
	);
}

export { MessagesPageShared };
