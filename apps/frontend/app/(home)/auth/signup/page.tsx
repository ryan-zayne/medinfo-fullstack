"use client";

import {
	DropZoneInput,
	DropZoneInputImagePreview,
	IconBox,
	Logo,
	NavLink,
	Show,
} from "@/components/common";
import { Button, DateTimePicker, Form, Select } from "@/components/ui";
import { DropZone } from "@/components/ui/drop-zone";
import { callBackendApi } from "@/lib/api/callBackendApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSchema as SignUpSchemaPrimitive } from "@medinfo/shared/validation/backendApiSchema";
import { toFormData } from "@zayne-labs/callapi/utils";
import { useRouter } from "next/navigation";
import { use } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Main } from "../../-components";
import { OAuthSection } from "../OAuthSection";

const SignUpSchema = SignUpSchemaPrimitive.safeExtend({
	confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords do not match",
	path: ["confirmPassword"],
});

function SignUpPage(props: PageProps<"/auth/signup">) {
	const { searchParams: searchParamsPromise } = props;

	const searchParams = use(searchParamsPromise);

	const userRole = (searchParams.user as z.infer<typeof SignUpSchema>["role"] | undefined) ?? "patient";

	const form = useForm({
		defaultValues: {
			role: userRole,
		},
		mode: "onTouched",
		resolver: zodResolver(SignUpSchema),
	});

	const { control } = form;

	const router = useRouter();

	const onSubmit = form.handleSubmit(async (data) => {
		await callBackendApi("@post/auth/signup", {
			body: toFormData(data),
			meta: { toast: { success: true } },

			onSuccess: () => {
				router.push(`/dashboard/${userRole}`);
			},
		});
	});

	return (
		<Main className="w-full px-0 max-md:max-w-[400px] md:flex md:flex-col md:items-center">
			<div
				className="rounded-[16px] border-[1.4px] border-medinfo-light-2
					shadow-[0_0_0_2px_hsl(0,0%,0%,0.25)] md:flex md:max-w-fit"
			>
				<section
					className="m-6 md:mx-[93px] md:my-11 md:flex md:w-full md:max-w-[460px] md:flex-col
						md:items-center"
				>
					<Logo className="max-lg:h-[46px] max-lg:w-[60px]" />

					<div className="mt-3 flex flex-col items-center gap-8">
						<h1
							className="max-w-[186px] text-center text-[24px] leading-[32px] font-semibold
								text-medinfo-primary-darker md:mx-[42px] md:max-w-[375px] md:text-[48px]
								md:leading-[56px] md:font-bold"
						>
							Join MedInfo Nigeria
						</h1>

						<Form.Root
							form={form}
							className="w-full gap-[14px]"
							onSubmit={(event) => void onSubmit(event)}
						>
							<Form.Field
								control={control}
								name="firstName"
								className="gap-1 font-roboto font-medium"
							>
								<Form.Label className="md:text-[20px]">First name</Form.Label>

								<Form.InputGroup
									className="h-12 gap-4 rounded-[8px] border-[1.4px] border-medinfo-primary-main
										px-4 py-3 md:h-[64px] md:py-5"
								>
									<Form.InputLeftItem className="size-5 md:size-6">
										<IconBox icon="majesticons:user-line" className="size-full" />
									</Form.InputLeftItem>

									<Form.Input
										type="text"
										placeholder="enter first name"
										className="placeholder:text-medinfo-dark-4 md:text-base"
									/>
								</Form.InputGroup>

								<Form.ErrorMessage />
							</Form.Field>

							<Form.Field
								control={control}
								name="lastName"
								className="gap-1 font-roboto font-medium"
							>
								<Form.Label className="md:text-[20px]">Last name</Form.Label>

								<Form.InputGroup
									className="h-12 gap-4 rounded-[8px] border-[1.4px] border-medinfo-primary-main
										px-4 py-3 md:h-[64px] md:py-5"
								>
									<Form.InputLeftItem className="size-5 md:size-6">
										<IconBox icon="majesticons:user-line" className="size-full" />
									</Form.InputLeftItem>

									<Form.Input
										type="text"
										placeholder="enter last name"
										className="placeholder:text-medinfo-dark-4 md:text-base"
									/>
								</Form.InputGroup>

								<Form.ErrorMessage />
							</Form.Field>

							<Form.Field control={control} name="email" className="gap-1 font-roboto font-medium">
								<Form.Label className="md:text-[20px]">Email</Form.Label>

								<Form.InputGroup
									className="h-12 gap-4 rounded-[8px] border-[1.4px] border-medinfo-primary-main
										px-4 py-3 md:h-[64px] md:py-5"
								>
									<Form.InputLeftItem className="size-5 md:size-6">
										<IconBox icon="mynaui:envelope" className="size-full" />
									</Form.InputLeftItem>

									<Form.Input
										type="email"
										placeholder="enter email"
										className="placeholder:text-medinfo-dark-4 md:text-base"
									/>
								</Form.InputGroup>

								<Form.ErrorMessage />
							</Form.Field>

							<Form.Field control={control} name="gender" className="gap-1 font-roboto font-medium">
								<Form.Label className="md:text-[20px]">Gender</Form.Label>

								<Form.FieldBoundController
									render={({ field }) => (
										<Select.Root
											name={field.name}
											value={field.value}
											onValueChange={field.onChange}
										>
											<Select.Trigger
												classNames={{
													base: `group h-12 gap-2 rounded-[8px] border-[1.4px]
													border-medinfo-primary-main px-4 font-medium
													data-placeholder:text-medinfo-dark-4 md:h-[64px] md:text-base`,
													icon: `text-medinfo-body-color group-data-[state=open]:rotate-180
													md:size-6`,
												}}
											>
												<Select.Value placeholder="select gender" />
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
														data-[state=checked]:bg-medinfo-light-1 md:h-[64px] md:text-base"
												>
													Male
												</Select.Item>
												<Select.Item
													value="female"
													className="h-12 bg-medinfo-light-3 font-medium text-medinfo-dark-4
														focus:bg-medinfo-light-1 focus:text-medinfo-body-color
														data-[state=checked]:bg-medinfo-light-1 md:h-[64px] md:text-base"
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
								control={control}
								name="country"
								className="gap-1 font-roboto font-medium"
							>
								<Form.Label className="md:text-[20px]">Country</Form.Label>

								<Form.FieldBoundController
									render={({ field }) => (
										<Select.Root
											name={field.name}
											value={field.value}
											onValueChange={field.onChange}
										>
											<Select.Trigger
												classNames={{
													base: `group h-12 gap-2 rounded-[8px] border-[1.4px]
													border-medinfo-primary-main px-4 font-medium
													data-placeholder:text-medinfo-dark-4 md:h-[64px] md:text-base`,
													icon: `text-medinfo-body-color group-data-[state=open]:rotate-180
													md:size-6`,
												}}
											>
												<Select.Value placeholder="select your country" />
											</Select.Trigger>

											<Select.Content
												classNames={{
													base: `border-[1.4px] border-medinfo-primary-main bg-white/90
													backdrop-blur-lg`,
												}}
											>
												<Select.Item
													withIndicator={false}
													value="Nigeria"
													className="h-12 bg-medinfo-light-3 font-medium text-medinfo-dark-4
														focus:bg-medinfo-light-1 focus:text-medinfo-body-color
														data-[state=checked]:bg-medinfo-light-1 md:h-[64px] md:text-base"
												>
													Nigeria
												</Select.Item>
												<Select.Item
													withIndicator={false}
													value="Ghana"
													className="h-12 bg-medinfo-light-3 font-medium text-medinfo-dark-4
														focus:bg-medinfo-light-1 focus:text-medinfo-body-color
														data-[state=checked]:bg-medinfo-light-1 md:h-[64px] md:text-base"
												>
													Ghana
												</Select.Item>
											</Select.Content>
										</Select.Root>
									)}
								/>

								<Form.ErrorMessage />
							</Form.Field>

							<Show.Root when={userRole === "doctor"}>
								<Form.Field
									control={control}
									name="specialty"
									className="gap-1 font-roboto font-medium"
								>
									<Form.Label className="md:text-[20px]">Specialty</Form.Label>

									<Form.FieldBoundController
										render={({ field }) => (
											<Select.Root
												name={field.name}
												value={field.value}
												onValueChange={field.onChange}
											>
												<Select.Trigger
													classNames={{
														base: `group h-12 gap-2 rounded-[8px] border-[1.4px]
														border-medinfo-primary-main px-4 font-medium
														data-placeholder:text-medinfo-dark-4 md:h-[64px] md:text-base`,
														icon: `text-medinfo-body-color group-data-[state=open]:rotate-180
														md:size-6`,
													}}
												>
													<Select.Value placeholder="select your specialty" />
												</Select.Trigger>

												<Select.Content
													classNames={{
														base: `border-[1.4px] border-medinfo-primary-main bg-white/90 p-0
														backdrop-blur-lg`,
													}}
												>
													<Select.Item
														withIndicator={false}
														value="steeze"
														className="h-12 bg-medinfo-light-3 font-medium
															text-medinfo-dark-4 focus:bg-medinfo-light-1
															focus:text-medinfo-body-color
															data-[state=checked]:bg-medinfo-light-1 md:h-[64px]
															md:text-base"
													>
														Steeze
													</Select.Item>
													<Select.Item
														withIndicator={false}
														value="cooking"
														className="h-12 bg-medinfo-light-3 font-medium
															text-medinfo-dark-4 focus:bg-medinfo-light-1
															focus:text-medinfo-body-color
															data-[state=checked]:bg-medinfo-light-1 md:h-[64px]
															md:text-base"
													>
														Cooking
													</Select.Item>
												</Select.Content>
											</Select.Root>
										)}
									/>

									<Form.ErrorMessage />
								</Form.Field>

								<Form.Field
									control={control}
									name="medicalLicense"
									className="gap-1 font-roboto font-medium"
								>
									<Form.Label className="md:text-[20px]">
										Upload medical license/certificate
									</Form.Label>

									<Form.FieldBoundController
										render={({ field }) => (
											<DropZoneInput
												allowedFileTypes={["image/jpeg", "image/png", "application/pdf"]}
												maxFileSize={{ mb: 4 }}
												disableFilePickerOpenOnAreaClick={true}
												onChange={field.onChange}
											>
												<DropZone.Area>
													<span className="block shrink-0 md:size-10">
														<IconBox icon="solar:file-send-outline" className="size-full" />
													</span>

													<p
														className="text-[18px] font-medium text-medinfo-primary-darker
															md:text-[20px]"
													>
														Drag files to upload
													</p>

													<p className="text-sm text-medinfo-dark-2">
														Files supported: JPG, PNG, PDF{" "}
													</p>

													<p className="text-sm text-medinfo-dark-2">or</p>

													<DropZone.Trigger asChild={true}>
														<Button size="large">Choose File</Button>
													</DropZone.Trigger>

													<p className="text-sm text-medinfo-dark-2">Maximum size: 4mb</p>
												</DropZone.Area>

												<DropZoneInputImagePreview
													classNames={{
														listContainer: "border-[1.4px] border-medinfo-primary-main",
													}}
												/>
											</DropZoneInput>
										)}
									/>

									<Form.ErrorMessage />
								</Form.Field>
							</Show.Root>

							<Form.Field control={control} name="dob" className="gap-1 font-roboto font-medium">
								<Form.Label className="md:text-[20px]">Date of Birth</Form.Label>

								<Form.FieldBoundController
									render={({ field }) => (
										<DateTimePicker
											className="h-12 gap-4 rounded-[8px] border-[1.4px]
												border-medinfo-primary-main px-4 py-3 text-[14px] md:h-[64px] md:py-5
												md:text-base"
											dateString={field.value}
											placeholder="DD/MM/YYYY"
											onDateStringChange={field.onChange}
										/>
									)}
								/>

								<Form.ErrorMessage />
							</Form.Field>

							<Form.Field
								control={control}
								name="password"
								className="gap-1 font-roboto font-medium"
							>
								<Form.Label className="md:text-[20px]">Password</Form.Label>

								<Form.InputGroup
									className="h-12 gap-4 rounded-[8px] border-[1.4px] border-medinfo-primary-main
										px-4 py-3 md:h-[64px] md:py-5"
								>
									<Form.InputLeftItem className="size-5 md:size-6">
										<IconBox icon="mynaui:lock-password" className="size-full" />
									</Form.InputLeftItem>

									<Form.Input
										type="password"
										placeholder="enter password"
										className="placeholder:text-medinfo-dark-4 md:text-base"
									/>
								</Form.InputGroup>

								<Form.ErrorMessage />
							</Form.Field>

							<Form.Field
								control={control}
								name="confirmPassword"
								className="gap-1 font-roboto font-medium"
							>
								<Form.Label className="md:text-[20px]">Confirm password</Form.Label>

								<Form.InputGroup
									className="h-12 gap-4 rounded-[8px] border-[1.4px] border-medinfo-primary-main
										px-4 py-3 md:h-[64px] md:py-5"
								>
									<Form.InputLeftItem className="size-5 md:size-6">
										<IconBox icon="mynaui:lock-password" className="size-full" />
									</Form.InputLeftItem>

									<Form.Input
										type="password"
										placeholder="enter password"
										className="placeholder:text-medinfo-dark-4 md:text-base"
									/>
								</Form.InputGroup>

								<Form.ErrorMessage />
							</Form.Field>

							<article className="flex flex-col items-center gap-[14px] md:mt-[14px] md:gap-7">
								<Show.Root when={userRole === "patient"}>
									<OAuthSection userRole={userRole} />
								</Show.Root>

								<Form.StateSubscribe
									render={(formState) => (
										<Button
											type="submit"
											isLoading={formState.isSubmitting}
											disabled={formState.isSubmitting}
											isDisabled={false}
										>
											Sign Up
										</Button>
									)}
								/>

								<div className="flex flex-col items-center gap-2">
									<NavLink
										transitionType="regular"
										href={{
											query: { user: userRole === "doctor" ? "patient" : "doctor" },
										}}
										className="text-medinfo-primary-main md:text-[20px]"
									>
										{userRole === "doctor" ? "Register as a patient" : "Register as a doctor"}
									</NavLink>

									<p className="md:hidden">
										Already have an account?{" "}
										<NavLink
											transitionType="regular"
											href={{
												pathname: "/auth/signin",
												query: { user: userRole === "doctor" ? "doctor" : "patient" },
											}}
											className="text-medinfo-primary-main"
										>
											Sign in
										</NavLink>
									</p>
								</div>
							</article>
						</Form.Root>
					</div>
				</section>

				<section
					className="flex w-[432px] flex-col items-center justify-center rounded-r-[16px]
						bg-medinfo-primary-main px-[35px] text-center text-white max-md:hidden xl:shrink-0"
				>
					<h2 className="text-[32px] font-semibold">Hello friend!</h2>

					<p className="mt-6 text-[18px]">
						Enter in your details and lets continue from where you stopped
					</p>

					<Button theme="secondary-inverted" className="mt-[38px]" asChild={true}>
						<NavLink
							href={{
								pathname: "/auth/signin",
								query: { user: userRole === "doctor" ? "doctor" : "patient" },
							}}
						>
							Sign in
						</NavLink>
					</Button>
				</section>
			</div>
		</Main>
	);
}

export default SignUpPage;
