"use client";

import { useForm } from "react-hook-form";
import { For } from "@/components/common/for";
import { Form } from "@/components/ui";
import { Main } from "./Main";

const notificationOptions = [
	{
		label: "A doctor answers your questions in the community",
		name: "answersInCommunity" as const,
	},
	{
		label: "Updates on a question you asked in the community",
		name: "updatesOnQuestion" as const,
	},
	{
		label: "A doctor replies your private message",
		name: "privateMessage" as const,
	},
	{
		label: "General announcements and offers for you",
		name: "generalAnnouncements" as const,
	},
];

function SettingsPageShared() {
	const notificationSettingsForm = useForm({
		defaultValues: {
			answersInCommunity: "yes",
			generalAnnouncements: "yes",
			privateMessage: "yes",
			updatesOnQuestion: "yes",
		},
	});

	return (
		<Main className="gap-8">
			<section className="flex flex-col gap-6 rounded-[16px] bg-white p-[16px] shadow-md lg:p-[28px]">
				<div className="flex flex-col gap-3">
					<h1 className="text-[18px] font-medium text-medinfo-dark-1 lg:text-[22px]">
						Notifications
					</h1>
					<p className="text-[14px] font-normal text-medinfo-dark-4">
						MedInfo Nigeria may still send you important notifications about your account outside of
						your preferred notification settings.
					</p>
				</div>

				<Form.Root
					className="flex w-full max-w-[683px] flex-col gap-6"
					form={notificationSettingsForm}
				>
					<For
						each={notificationOptions}
						renderItem={(option) => (
							<div key={option.name} className="flex justify-between gap-4">
								<h2 className="w-[235px] text-medinfo-dark-1 lg:w-auto lg:text-[18px]">
									{option.label}
								</h2>

								<Form.Field name={option.name} className="flex flex-col gap-2">
									<Form.Label
										htmlFor={undefined}
										className="flex flex-row-reverse items-center justify-end gap-2 text-[14px]
											font-normal lg:text-[16px]"
									>
										<p>Yes</p>
										<Form.Input
											type="radio"
											value="yes"
											className="size-5 accent-medinfo-primary-main lg:size-6"
										/>
									</Form.Label>

									<Form.Label
										htmlFor={undefined}
										className="flex flex-row-reverse items-center justify-end gap-2 text-[14px]
											font-normal lg:text-[16px]"
									>
										<p>No</p>
										<Form.Input
											type="radio"
											value="no"
											className="size-5 accent-medinfo-primary-main lg:size-6"
										/>
									</Form.Label>
									<Form.ErrorMessage />
								</Form.Field>
							</div>
						)}
					/>
				</Form.Root>
			</section>

			<section className="flex flex-col gap-10 rounded-[16px] bg-white p-[28px] shadow-md">
				<h2 className="text-[18px] font-medium lg:text-[22px]">About MedInfo Nigeria</h2>
				<div className="flex flex-col gap-4 text-[20px] font-medium text-medinfo-primary-main">
					<p
						className="cursor-pointer text-[16px] transition-colors hover:text-medinfo-dark-1
							lg:text-[20px]"
					>
						Terms of use
					</p>
					<hr className="w-full border-medinfo-secondary-main" />
					<p
						className="cursor-pointer text-[16px] transition-colors hover:text-medinfo-dark-1
							lg:text-[20px]"
					>
						Privacy policy
					</p>
				</div>
			</section>
		</Main>
	);
}

export { SettingsPageShared };
