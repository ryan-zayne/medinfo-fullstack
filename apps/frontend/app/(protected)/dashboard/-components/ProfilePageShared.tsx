"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CameraIcon } from "@/components/icons";
import { Button, Form, Select } from "@/components/ui";
import { callBackendApiForQuery } from "@/lib/api/callBackendApi";
import { backendApiSchemaRoutes } from "@/lib/api/callBackendApi/apiSchema";
import { sessionQuery } from "@/lib/react-query/queryOptions";

const UpdateProfileSchema = backendApiSchemaRoutes["@patch/auth/update-profile"].body;
const ChangePasswordSchema = backendApiSchemaRoutes["@patch/auth/change-password"].body;

function ProfilePageShared() {
	const { data: sessionData } = useSuspenseQuery(sessionQuery());
	const user = sessionData.data.user;

	const userIdentityForm = useForm({
		resolver: zodResolver(
			UpdateProfileSchema.pick({ bio: true, firstName: true, gender: true, lastName: true }).extend({
				bio: z.string().max(500, "Bio must be under 500 characters").optional(),
			})
		),
		values: {
			bio: user.bio ?? "",
			firstName: user.firstName,
			gender: user.gender,
			lastName: user.lastName,
		},
	});

	const locationForm = useForm({
		resolver: zodResolver(UpdateProfileSchema.pick({ city: true, country: true })),
		values: {
			city: user.city ?? "",
			country: user.country ?? "",
		},
	});

	const contactInfoForm = useForm({
		resolver: zodResolver(UpdateProfileSchema.pick({ email: true })),
		values: {
			email: user.email,
		},
	});

	const changePasswordForm = useForm({
		defaultValues: {
			confirmNewPassword: "",
			currentPassword: "",
			newPassword: "",
		},
		resolver: zodResolver(ChangePasswordSchema),
	});

	const onUpdateIdentity = userIdentityForm.handleSubmit(async (data) => {
		await callBackendApiForQuery("@patch/auth/update-profile", {
			body: data,
			meta: { toast: { success: true } },
			onSuccess: () => {
				userIdentityForm.reset();
			},
		});
	});

	const onUpdateLocation = locationForm.handleSubmit(async (data) => {
		await callBackendApiForQuery("@patch/auth/update-profile", {
			body: data,
			meta: { toast: { success: true } },
			onSuccess: () => {
				locationForm.reset();
			},
		});
	});

	const onChangePassword = changePasswordForm.handleSubmit(async (data) => {
		await callBackendApiForQuery("@patch/auth/change-password", {
			body: data,
			meta: { toast: { success: true } },

			onSuccess: () => {
				changePasswordForm.reset();
			},
		});
	});

	return (
		<div className="flex flex-col gap-8 px-6 py-14">
			<section
				className="flex flex-col gap-5 rounded-2xl p-4
					shadow-[0_4px_8px_theme(--color-medinfo-primary-main/0.25)] lg:bg-white lg:p-8"
			>
				<div
					className="relative -z-10 size-27 rounded-full border-[1.4px] border-medinfo-primary-main
						bg-gray-300 lg:size-35"
				>
					<div
						className="absolute top-0.5 right-0 flex size-6 items-center justify-center rounded-full
							border-[1.4px] border-medinfo-primary-main bg-white lg:size-10"
					>
						<CameraIcon className="size-4 lg:size-6.5" />
					</div>
				</div>

				<div className="flex gap-4">
					<Button theme="primary-ghost">Remove</Button>
					<Button theme="primary">Change</Button>
				</div>
			</section>

			<section
				className="flex flex-col gap-5 rounded-2xl p-4
					shadow-[0_4px_8_theme(--color-medinfo-primary-main/0.25)] lg:flex-row lg:justify-between
					lg:bg-white lg:p-8"
			>
				<h3 className="text-[18px] font-medium lg:min-w-39">User Identity</h3>

				<Form.Root
					className="w-full max-w-93 gap-3 self-center"
					form={userIdentityForm}
					onSubmit={(event) => void onUpdateIdentity(event)}
				>
					<Form.Field
						control={userIdentityForm.control}
						name="firstName"
						className="gap-1 font-roboto font-medium"
					>
						<Form.Label className="md:text-[20px]">First Name</Form.Label>
						<Form.Input
							type="text"
							className="h-12 rounded-lg border-[1.4px] border-medinfo-primary-main px-4 py-3
								placeholder:text-medinfo-dark-4 md:h-16 md:py-5 md:text-base"
						/>
						<Form.ErrorMessage />
					</Form.Field>

					<Form.Field
						control={userIdentityForm.control}
						name="lastName"
						className="gap-1 font-roboto font-medium"
					>
						<Form.Label className="md:text-[20px]">Last Name</Form.Label>
						<Form.Input
							type="text"
							className="h-12 rounded-lg border-[1.4px] border-medinfo-primary-main px-4 py-3
								placeholder:text-medinfo-dark-4 md:h-16 md:py-5 md:text-base"
						/>
						<Form.ErrorMessage />
					</Form.Field>

					<Form.Field
						control={userIdentityForm.control}
						name="gender"
						className="gap-1 font-roboto font-medium"
					>
						<Form.Label className="md:text-[20px]">Gender</Form.Label>

						<Form.FieldBoundController
							render={({ field }) => (
								<Select.Root name={field.name} value={field.value} onValueChange={field.onChange}>
									<Select.Trigger
										classNames={{
											base: `group h-12 gap-2 rounded-lg border-[1.4px]
											border-medinfo-primary-main px-4 font-medium
											data-placeholder:text-medinfo-dark-4 md:h-16 md:text-base`,
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
											className="h-12 bg-medinfo-light-3 font-medium text-medinfo-dark-4
												focus:bg-medinfo-light-1 focus:text-medinfo-body-color
												data-[state=checked]:bg-medinfo-light-1 md:h-16 md:text-base"
										>
											Male
										</Select.Item>
										<Select.Item
											value="female"
											className="h-12 bg-medinfo-light-3 font-medium text-medinfo-dark-4
												focus:bg-medinfo-light-1 focus:text-medinfo-body-color
												data-[state=checked]:bg-medinfo-light-1 md:h-16 md:text-base"
										>
											Female
										</Select.Item>
									</Select.Content>
								</Select.Root>
							)}
						/>
						<Form.ErrorMessage />
					</Form.Field>

					<Form.Field
						control={userIdentityForm.control}
						name="bio"
						className="gap-1 font-roboto font-medium"
					>
						<Form.Label className="md:text-[20px]">Bio</Form.Label>

						<Form.Input
							type="textarea"
							className="h-40.75 rounded-lg border-[1.4px] border-medinfo-primary-main px-4 py-5
								placeholder:text-medinfo-dark-4 md:h-39.75 md:text-base"
						/>
						<Form.ErrorMessage />
					</Form.Field>

					<div className="flex gap-6 self-center lg:self-end">
						<Button type="button" theme="primary-ghost" onClick={() => userIdentityForm.reset()}>
							Cancel
						</Button>
						<Form.StateSubscribe
							render={(formState) => (
								<Button
									type="submit"
									theme="primary"
									isLoading={formState.isSubmitting}
									disabled={formState.isSubmitting}
								>
									Save
								</Button>
							)}
						/>
					</div>
				</Form.Root>
			</section>

			<section
				className="flex flex-col gap-5 rounded-2xl p-4
					shadow-[0_4px_8_theme(--color-medinfo-primary-main/0.25)] lg:flex-row lg:justify-between
					lg:bg-white lg:p-8"
			>
				<h3 className="text-[18px] font-medium lg:min-w-39">Contact Info</h3>

				<Form.Root className="w-full max-w-93 gap-3 self-center" form={contactInfoForm}>
					<Form.Field
						control={contactInfoForm.control}
						name="email"
						className="gap-1 font-roboto font-medium"
					>
						<Form.Label className="md:text-[20px]">Email</Form.Label>
						<Form.Input
							className="h-12 cursor-not-allowed rounded-[8px] border-[1.4px]
								border-medinfo-primary-main bg-medinfo-light-3 px-4 py-3 text-medinfo-dark-4
								md:h-[64px] md:py-5 md:text-base"
						/>
					</Form.Field>

					{/* <Form.Field
						control={contactInfoForm.control}
						name="phoneNumber"
						className="gap-1 font-roboto font-medium"
					>
						<Form.Label className="md:text-[20px]">Phone number</Form.Label>
						<Form.Input
							disabled={true}
							value={user.phoneNumber ?? "(Not verified)"}
							className="h-12 cursor-not-allowed rounded-lg border-[1.4px]
								border-medinfo-primary-main bg-medinfo-light-3 px-4 py-3 text-medinfo-dark-4
								md:h-16 md:py-5 md:text-base"
						/>
					</Form.Field> */}
				</Form.Root>

				<div className="invisible flex gap-6 self-center lg:self-end">
					<Button theme="primary-ghost">Cancel</Button>
					<Button theme="primary">Save</Button>
				</div>
			</section>

			<section
				className="flex flex-col gap-5 rounded-2xl p-4
					shadow-[0_4px_8_theme(--color-medinfo-primary-main/0.25)] lg:flex-row lg:justify-between
					lg:bg-white lg:p-8"
			>
				<h3 className="text-[18px] font-medium lg:min-w-39">Location</h3>

				<Form.Root
					className="w-full max-w-93 gap-3 self-center"
					form={locationForm}
					onSubmit={(event) => void onUpdateLocation(event)}
				>
					<Form.Field
						control={locationForm.control}
						name="country"
						className="gap-1 font-roboto font-medium"
					>
						<Form.Label className="md:text-[20px]">Country</Form.Label>
						<Form.Input
							type="text"
							className="h-12 rounded-lg border-[1.4px] border-medinfo-primary-main px-4 py-3
								placeholder:text-medinfo-dark-4 md:h-16 md:py-5 md:text-base"
						/>
						<Form.ErrorMessage />
					</Form.Field>
					<Form.Field
						control={locationForm.control}
						name="city"
						className="gap-1 font-roboto font-medium"
					>
						<Form.Label className="md:text-[20px]">City</Form.Label>
						<Form.Input
							type="text"
							className="h-12 rounded-lg border-[1.4px] border-medinfo-primary-main px-4 py-3
								placeholder:text-medinfo-dark-4 md:h-16 md:py-5 md:text-base"
						/>
						<Form.ErrorMessage />
					</Form.Field>

					<div className="flex gap-6 self-center lg:self-end">
						<Button type="button" theme="primary-ghost" onClick={() => locationForm.reset()}>
							Cancel
						</Button>
						<Form.StateSubscribe
							render={(formState) => (
								<Button
									type="submit"
									theme="primary"
									isLoading={formState.isSubmitting}
									disabled={formState.isSubmitting}
								>
									Save
								</Button>
							)}
						/>
					</div>
				</Form.Root>
			</section>

			<section
				className="flex flex-col gap-5 rounded-2xl p-4
					shadow-[0_4px_8_theme(--color-medinfo-primary-main/0.25)] lg:flex-row lg:justify-between
					lg:bg-white lg:p-8"
			>
				<h3 className="text-[18px] font-medium lg:min-w-39">Change Password</h3>

				<Form.Root
					className="w-full max-w-93 gap-3 self-center"
					form={changePasswordForm}
					onSubmit={(event) => void onChangePassword(event)}
				>
					<Form.Field
						control={changePasswordForm.control}
						name="currentPassword"
						className="gap-1 font-roboto font-medium"
					>
						<Form.Label className="md:text-[20px]">Old password</Form.Label>
						<Form.Input
							type="password"
							classNames={{
								input: "placeholder:text-medinfo-dark-4 md:text-base",
								inputGroup: `h-12 rounded-lg border-[1.4px] border-medinfo-primary-main px-4 py-3
								md:h-16 md:py-5`,
							}}
						/>
						<Form.ErrorMessage />
					</Form.Field>

					<Form.Field
						control={changePasswordForm.control}
						name="newPassword"
						className="gap-1 font-roboto font-medium"
					>
						<Form.Label className="md:text-[20px]">New password</Form.Label>
						<Form.Input
							type="password"
							classNames={{
								input: "placeholder:text-medinfo-dark-4 md:text-base",
								inputGroup: `h-12 rounded-lg border-[1.4px] border-medinfo-primary-main px-4 py-3
								md:h-16 md:py-5`,
							}}
						/>
						<Form.ErrorMessage />
					</Form.Field>

					<Form.Field
						control={changePasswordForm.control}
						name="confirmNewPassword"
						className="gap-1 font-roboto font-medium"
					>
						<Form.Label className="md:text-[20px]">Confirm password</Form.Label>
						<Form.Input
							type="password"
							classNames={{
								input: "placeholder:text-medinfo-dark-4 md:text-base",
								inputGroup: `h-12 rounded-lg border-[1.4px] border-medinfo-primary-main px-4 py-3
								md:h-16 md:py-5`,
							}}
						/>
						<Form.ErrorMessage />
					</Form.Field>

					<div className="flex gap-6 self-center lg:self-end">
						<Button type="button" theme="primary-ghost" onClick={() => changePasswordForm.reset()}>
							Cancel
						</Button>
						<Form.StateSubscribe
							render={(formState) => (
								<Button
									type="submit"
									theme="primary"
									isLoading={formState.isSubmitting}
									disabled={formState.isSubmitting}
								>
									Save
								</Button>
							)}
						/>
					</div>
				</Form.Root>
			</section>
		</div>
	);
}

export { ProfilePageShared };
