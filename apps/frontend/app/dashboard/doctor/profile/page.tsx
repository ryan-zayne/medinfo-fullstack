"use client";

import { CameraIcon } from "@/components/icons";
import { Button, Form, Select } from "@/components/ui";
import { useForm } from "react-hook-form";

function ProfilePage() {
	const userIdentityMethods = useForm({
		defaultValues: { bio: "", firstName: "", gender: "", lastName: "" },
	});

	const contactInfoMethods = useForm({
		defaultValues: { email: "", phoneNumber: "" },
	});

	const locationMethods = useForm({
		defaultValues: { city: "", country: "" },
	});

	const changePasswordMethods = useForm({
		defaultValues: { confirmPassword: "", newPassword: "", oldPassword: "" },
	});

	return (
		<div className="flex flex-col gap-8 px-6 py-14">
			<section
				className="flex flex-col gap-5 rounded-[16px] p-4 shadow-[0_4px_6px_hsl(150,20%,25%,0.25)]
					lg:bg-white lg:p-8"
			>
				<div
					className="relative -z-10 size-[108px] rounded-full border-[1.4px]
						border-medinfo-primary-main bg-gray-300 lg:size-[140px]"
				>
					<div
						className="absolute top-[2px] right-0 flex size-[24px] items-center justify-center
							rounded-full border-[1.4px] border-medinfo-primary-main bg-white lg:size-[40px]"
					>
						<CameraIcon className="size-[16px] lg:size-[26px]" />
					</div>
				</div>

				<div className="flex gap-4">
					<Button theme="secondary">Remove</Button>
					<Button theme="primary">Change</Button>
				</div>
			</section>

			<section
				className="flex flex-col gap-5 rounded-[16px] p-4 shadow-[0_4px_6px_hsl(150,20%,25%,0.25)]
					lg:flex-row lg:justify-between lg:bg-white lg:p-8"
			>
				<h3 className="text-[18px] font-medium lg:min-w-[156px]">User Identity</h3>

				<Form.Root className="w-full max-w-[372px] gap-3 self-center" methods={userIdentityMethods}>
					<Form.Field<typeof userIdentityMethods.control>
						name="firstName"
						className="gap-1 font-roboto font-medium"
					>
						<Form.Label className="md:text-[20px]">First Name</Form.Label>
						<Form.Input
							type="text"
							className="h-[48px] rounded-[8px] border-[1.4px] border-medinfo-primary-main px-4 py-3
								placeholder:text-medinfo-dark-4 md:h-[64px] md:py-5 md:text-base"
						/>
					</Form.Field>
					<Form.Field<typeof userIdentityMethods.control>
						name="lastName"
						className="gap-1 font-roboto font-medium"
					>
						<Form.Label className="md:text-[20px]">Last Name</Form.Label>
						<Form.Input
							type="text"
							className="h-[48px] rounded-[8px] border-[1.4px] border-medinfo-primary-main px-4 py-3
								placeholder:text-medinfo-dark-4 md:h-[64px] md:py-5 md:text-base"
						/>
					</Form.Field>
					<Form.Field name="gender" className="gap-1 font-roboto font-medium">
						<Form.Label className="md:text-[20px]">Gender</Form.Label>

						<Form.FieldController
							render={({ field }) => (
								<Select.Root name={field.name} value={field.value} onValueChange={field.onChange}>
									<Select.Trigger
										classNames={{
											base: `group h-[48px] gap-2 rounded-[8px] border-[1.4px]
											border-medinfo-primary-main px-4 font-medium
											data-placeholder:text-medinfo-dark-4 md:h-[64px] md:text-base`,
											icon: `text-medinfo-body-color group-data-[state=open]:rotate-180
											md:size-6`,
										}}
									>
										<Select.Value placeholder="specify gender" />
									</Select.Trigger>

									<Select.Content
										classNames={{
											base: `border-[1.4px] border-medinfo-primary-main bg-white/90 p-0
											backdrop-blur-lg`,
											viewport: "gap-1",
										}}
									>
										<Select.Item
											value="male"
											className="h-[48px] bg-medinfo-light-3 font-medium text-medinfo-dark-4
												focus:bg-medinfo-light-1 focus:text-medinfo-body-color
												data-[state=checked]:bg-medinfo-light-1 md:h-[64px] md:text-base"
										>
											Male
										</Select.Item>
										<Select.Item
											value="female"
											className="h-[48px] bg-medinfo-light-3 font-medium text-medinfo-dark-4
												focus:bg-medinfo-light-1 focus:text-medinfo-body-color
												data-[state=checked]:bg-medinfo-light-1 md:h-[64px] md:text-base"
										>
											Female
										</Select.Item>
									</Select.Content>
								</Select.Root>
							)}
						/>
					</Form.Field>

					<Form.Field<typeof userIdentityMethods.control>
						name="bio"
						className="gap-1 font-roboto font-medium"
					>
						<Form.Label className="md:text-[20px]">Bio</Form.Label>

						<Form.Input
							type="textarea"
							className="h-[163px] rounded-[8px] border-[1.4px] border-medinfo-primary-main px-4
								py-5 placeholder:text-medinfo-dark-4 md:h-[159px] md:text-base"
						/>
					</Form.Field>
				</Form.Root>

				<div className="flex gap-6 self-center lg:self-end">
					<Button theme="secondary">Cancel</Button>
					<Button theme="primary">Save</Button>
				</div>
			</section>

			<section
				className="flex flex-col gap-5 rounded-[16px] p-4 shadow-[0_4px_6px_hsl(150,20%,25%,0.25)]
					lg:flex-row lg:justify-between lg:bg-white lg:p-8"
			>
				<h3 className="text-[18px] font-medium lg:min-w-[156px]">Contact Info</h3>

				<Form.Root className="w-full max-w-[372px] gap-3 self-center" methods={contactInfoMethods}>
					<Form.Field<typeof contactInfoMethods.control>
						name="email"
						className="gap-1 font-roboto font-medium"
					>
						<Form.Label className="md:text-[20px]">Email</Form.Label>
						<Form.Input
							type="text"
							className="h-[48px] rounded-[8px] border-[1.4px] border-medinfo-primary-main px-4 py-3
								placeholder:text-medinfo-dark-4 md:h-[64px] md:py-5 md:text-base"
						/>
					</Form.Field>
					<Form.Field<typeof contactInfoMethods.control>
						name="phoneNumber"
						className="gap-1 font-roboto font-medium"
					>
						<Form.Label className="md:text-[20px]">Phone number</Form.Label>
						<Form.Input
							type="number"
							className="h-[48px] rounded-[8px] border-[1.4px] border-medinfo-primary-main px-4 py-3
								placeholder:text-medinfo-dark-4 md:h-[64px] md:py-5 md:text-base"
						/>
					</Form.Field>
				</Form.Root>

				<div className="flex gap-6 self-center lg:self-end">
					<Button theme="secondary">Cancel</Button>
					<Button theme="primary">Save</Button>
				</div>
			</section>

			<section
				className="flex flex-col gap-5 rounded-[16px] p-4 shadow-[0_4px_6px_hsl(150,20%,25%,0.25)]
					lg:flex-row lg:justify-between lg:bg-white lg:p-8"
			>
				<h3 className="text-[18px] font-medium lg:min-w-[156px]">Location</h3>

				<Form.Root className="w-full max-w-[372px] gap-3 self-center" methods={locationMethods}>
					<Form.Field<typeof locationMethods.control>
						name="country"
						className="gap-1 font-roboto font-medium"
					>
						<Form.Label className="md:text-[20px]">Country</Form.Label>
						<Form.Input
							type="text"
							className="h-[48px] rounded-[8px] border-[1.4px] border-medinfo-primary-main px-4 py-3
								placeholder:text-medinfo-dark-4 md:h-[64px] md:py-5 md:text-base"
						/>
					</Form.Field>
					<Form.Field<typeof locationMethods.control>
						name="city"
						className="gap-1 font-roboto font-medium"
					>
						<Form.Label className="md:text-[20px]">City</Form.Label>
						<Form.Input
							type="text"
							className="h-[48px] rounded-[8px] border-[1.4px] border-medinfo-primary-main px-4 py-3
								placeholder:text-medinfo-dark-4 md:h-[64px] md:py-5 md:text-base"
						/>
					</Form.Field>
				</Form.Root>

				<div className="flex gap-6 self-center lg:self-end">
					<Button theme="secondary">Cancel</Button>
					<Button theme="primary">Save</Button>
				</div>
			</section>

			<section
				className="flex flex-col gap-5 rounded-[16px] p-4 shadow-[0_4px_6px_hsl(150,20%,25%,0.25)]
					lg:flex-row lg:justify-between lg:bg-white lg:p-8"
			>
				<h3 className="text-[18px] font-medium lg:min-w-[156px]">Change Password</h3>

				<Form.Root className="w-full max-w-[372px] gap-3 self-center" methods={changePasswordMethods}>
					<Form.Field<typeof changePasswordMethods.control>
						name="oldPassword"
						className="gap-1 font-roboto font-medium"
					>
						<Form.Label className="md:text-[20px]">Old password</Form.Label>
						<Form.Input
							type="password"
							classNames={{
								input: "placeholder:text-medinfo-dark-4 md:text-base",
								inputGroup: `h-[48px] rounded-[8px] border-[1.4px] border-medinfo-primary-main px-4
								py-3 md:h-[64px] md:py-5`,
							}}
						/>
					</Form.Field>
					<Form.Field<typeof changePasswordMethods.control>
						name="newPassword"
						className="gap-1 font-roboto font-medium"
					>
						<Form.Label className="md:text-[20px]">New password</Form.Label>
						<Form.Input
							type="password"
							classNames={{
								input: "placeholder:text-medinfo-dark-4 md:text-base",
								inputGroup: `h-[48px] rounded-[8px] border-[1.4px] border-medinfo-primary-main px-4
								py-3 md:h-[64px] md:py-5`,
							}}
						/>
					</Form.Field>
					<Form.Field<typeof changePasswordMethods.control>
						name="confirmPassword"
						className="gap-1 font-roboto font-medium"
					>
						<Form.Label className="md:text-[20px]">Confirm password</Form.Label>
						<Form.Input
							type="password"
							classNames={{
								input: "placeholder:text-medinfo-dark-4 md:text-base",
								inputGroup: `h-[48px] rounded-[8px] border-[1.4px] border-medinfo-primary-main px-4
								py-3 md:h-[64px] md:py-5`,
							}}
						/>
					</Form.Field>
				</Form.Root>

				<div className="flex gap-6 self-center lg:self-end">
					<Button theme="secondary">Cancel</Button>
					<Button theme="primary">Save</Button>
				</div>
			</section>
		</div>
	);
}
export default ProfilePage;
