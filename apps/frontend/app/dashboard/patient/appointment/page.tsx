"use client";

import { IconBox, Show } from "@/components/common";
import { getElementList } from "@/components/common/for";
import { CloseIcon, GreenSpinnerIcon } from "@/components/icons";
import { Button, DateTimePicker, Dialog, Form, Select } from "@/components/ui";
import { bookAppointmentQuery, matchDoctorsQuery } from "@/lib/react-query/queryOptions";
import { capitalize } from "@/lib/utils";
import { cnJoin, cnMerge } from "@/lib/utils/cn";
import { appointmentPlaceholder, doctorAvatar } from "@/public/assets/images/dashboard";
import { Steps, useStepsContext } from "@ark-ui/react/steps";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDisclosure } from "@zayne-labs/toolkit-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Main } from "../../-components";

const stepperItems = [
	{
		title: "Book appointment",
	},
	{
		title: "Accept specialist",
	},
];

type AppointmentFormData = {
	agreeToPrivacyPolicy: string;
	allergies: string;
	allowEmailOrSMS: string;
	allowInfoDisclosure: string;
	allowTeleMedicine: string;
	dateOfAppointment: string;
	dob: string;
	email: string;
	gender: string;
	healthInsurance: string;
	language: string;
	medicalConditions: string;
	name: string;
	phoneNumber: string;
	reason: string;
};

function AppointmentPage() {
	const methods = useForm<AppointmentFormData>({
		defaultValues: {
			agreeToPrivacyPolicy: "",
			allergies: "",
			allowEmailOrSMS: "",
			allowInfoDisclosure: "",
			allowTeleMedicine: "",
			dateOfAppointment: "",
			dob: "",
			email: "",
			gender: "",
			healthInsurance: "",
			medicalConditions: "",
			name: "",
			phoneNumber: "",
			reason: "",
		},
	});

	const [formData, setFormData] = useState<AppointmentFormData | null>(null);

	const queryClient = useQueryClient();

	const onSubmit = methods.handleSubmit((data) => {
		setFormData(data);
		const queryKey = matchDoctorsQuery({ formData: data }).queryKey;
		void queryClient.refetchQueries({ queryKey });
	});

	return (
		<Main className="w-full gap-8 max-md:mx-auto max-md:max-w-[400px]">
			<header>
				<Button size="icon" theme="primary-inverted" className="border-[0.6px] border-medinfo-light-1">
					<IconBox icon="lucide:chevron-left" className="size-5 text-medinfo-primary-darker" />
				</Button>
			</header>

			<Form.Root methods={methods} onSubmit={(event) => void onSubmit(event)}>
				<Steps.Root
					count={stepperItems.length}
					linear={true}
					className="flex flex-col gap-8 rounded-[16px] p-4 shadow-[0_4px_6px_hsl(150,20%,25%,0.25)]
						md:p-8"
				>
					<StepperList className="mb-7" />

					<section className="flex flex-col gap-[64px] max-md:items-center">
						<div className="flex gap-5">
							<Image
								src={appointmentPlaceholder as string}
								className="size-[88px]"
								width={88}
								height={88}
								alt=""
							/>

							<h1 className="text-[18px] font-medium md:text-[24px]">Primary care appointment</h1>
						</div>
					</section>

					<hr className="h-[0.6px] bg-medinfo-light-1" />

					<section className="flex flex-col gap-4">
						<h2 className="text-[18px] font-medium text-medinfo-dark-1 md:text-[22px]">
							Patient Information
						</h2>

						<div className="flex gap-2 md:gap-5">
							<Form.Field name="info" className="flex-row-reverse items-center gap-2">
								<Form.Label className="text-[14px] md:text-base">Use current profile</Form.Label>

								<Form.InputPrimitive
									type="radio"
									value="manual"
									className="size-5 accent-medinfo-primary-main"
								/>
							</Form.Field>

							<Form.Field name="info" className="flex-row-reverse items-center gap-2">
								<Form.Label className="text-[14px] md:text-base">Fill out manually</Form.Label>

								<Form.InputPrimitive
									defaultChecked={true}
									type="radio"
									value="manual"
									className="size-5 accent-medinfo-primary-main"
								/>
							</Form.Field>
						</div>

						<article className="flex flex-col gap-4 md:flex-row md:gap-[92px]">
							<div className="flex w-full flex-col gap-4">
								<Form.Field
									control={methods.control}
									name="name"
									className="gap-1 font-roboto font-medium"
								>
									<Form.Label className="md:text-[20px]">Name</Form.Label>

									<Form.Input
										type="text"
										placeholder="enter full name"
										className="h-[48px] gap-4 rounded-[8px] border-[1.4px]
											border-medinfo-primary-main px-4 py-3 placeholder:text-medinfo-dark-4
											md:h-[64px] md:py-5 md:text-base"
									/>
								</Form.Field>

								<Form.Field
									control={methods.control}
									name="email"
									className="gap-1 font-roboto font-medium"
								>
									<Form.Label className="md:text-[20px]">Email</Form.Label>

									<Form.Input
										type="email"
										placeholder="enter email"
										className="h-[48px] gap-4 rounded-[8px] border-[1.4px]
											border-medinfo-primary-main px-4 py-3 placeholder:text-medinfo-dark-4
											md:h-[64px] md:py-5 md:text-base"
									/>
								</Form.Field>

								<Form.Field
									control={methods.control}
									name="phoneNumber"
									className="gap-1 font-roboto font-medium"
								>
									<Form.Label className="md:text-[20px]">Phone Number</Form.Label>

									<Form.Input
										type="text"
										placeholder="enter phone number"
										className="h-[48px] gap-4 rounded-[8px] border-[1.4px]
											border-medinfo-primary-main px-4 py-3 placeholder:text-medinfo-dark-4
											md:h-[64px] md:py-5 md:text-base"
									/>
								</Form.Field>
							</div>

							<div className="flex w-full flex-col gap-4">
								<Form.Field
									control={methods.control}
									name="gender"
									className="gap-1 font-roboto font-medium"
								>
									<Form.Label className="md:text-[20px]">Gender</Form.Label>

									<Form.FieldController
										render={({ field }) => (
											<Select.Root
												name={field.name}
												value={field.value}
												onValueChange={field.onChange}
											>
												<Select.Trigger
													classNames={{
														base: `group h-[48px] gap-2 rounded-[8px] border-[1.4px]
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
														value="Male"
														className="h-[48px] bg-medinfo-light-3 font-medium
															text-medinfo-dark-4 focus:bg-medinfo-light-1
															focus:text-medinfo-body-color
															data-[state=checked]:bg-medinfo-light-1 md:h-[64px]
															md:text-base"
													>
														Male
													</Select.Item>
													<Select.Item
														value="Female"
														className="h-[48px] bg-medinfo-light-3 font-medium
															text-medinfo-dark-4 focus:bg-medinfo-light-1
															focus:text-medinfo-body-color
															data-[state=checked]:bg-medinfo-light-1 md:h-[64px]
															md:text-base"
													>
														Female
													</Select.Item>
												</Select.Content>
											</Select.Root>
										)}
									/>
								</Form.Field>

								<Form.Field
									control={methods.control}
									name="dob"
									className="gap-1 font-roboto font-medium"
								>
									<Form.Label className="md:text-[20px]">Date of Birth</Form.Label>

									<Form.FieldController
										render={({ field }) => (
											<DateTimePicker
												className="h-[48px] gap-4 rounded-[8px] border-[1.4px]
													border-medinfo-primary-main px-4 py-3 text-[14px] md:h-[64px]
													md:py-5 md:text-base"
												dateString={field.value}
												placeholder="DD/MM/YYYY"
												onDateStringChange={field.onChange}
											/>
										)}
									/>
								</Form.Field>
							</div>
						</article>
					</section>

					<hr className="h-[0.6px] bg-medinfo-light-1" />

					<section className="flex flex-col gap-4">
						<h2 className="text-[18px] font-medium text-medinfo-dark-1 md:text-[22px]">
							Appointment details
						</h2>

						<article className="flex flex-col gap-4 md:flex-row md:gap-[92px]">
							<Form.Field
								control={methods.control}
								name="reason"
								className="w-full gap-1 font-roboto font-medium"
							>
								<Form.Label className="md:text-[20px]">Reason</Form.Label>

								<Form.Input
									type="textarea"
									placeholder="tell us your symptoms"
									className="[field-sizing:content] min-h-[180px] gap-4 rounded-[8px]
										border-[1.4px] border-medinfo-primary-main px-4 py-3
										placeholder:text-medinfo-dark-4 md:py-5 md:text-base"
								/>
							</Form.Field>

							<div className="flex w-full flex-col gap-4">
								<Form.Field control={methods.control} name="dateOfAppointment" className="gap-1">
									<Form.Label className="font-roboto font-medium md:text-[20px]">
										Preferred date & time
									</Form.Label>

									<Form.FieldController
										render={({ field }) => (
											<DateTimePicker
												variant="datetime"
												formats={{
													onChangeDate: "yyyy-MM-dd'T'HH:mm:ss",
													visibleDate: "PPP - HH:mm:ss",
												}}
												className="h-[48px] gap-4 rounded-[8px] border-[1.4px]
													border-medinfo-primary-main px-4 py-3 text-[14px] md:h-[64px]
													md:py-5 md:text-base"
												dateString={field.value}
												placeholder="YYYY-MM-DD - 00:00:00"
												onDateStringChange={field.onChange}
											/>
										)}
									/>
								</Form.Field>

								<Form.Field
									control={methods.control}
									name="language"
									className="gap-1 font-roboto font-medium"
								>
									<Form.Label className="text-medinfo-dark-4 md:text-[20px]">Language</Form.Label>

									<Form.FieldController
										render={({ field }) => (
											<Select.Root
												disabled={true}
												defaultValue="English"
												name={field.name}
												value={field.value}
												onValueChange={field.onChange}
											>
												<Select.Trigger
													classNames={{
														base: `group h-[48px] gap-2 rounded-[8px] border-[1.4px]
														border-medinfo-primary-main px-4 font-medium
														disabled:border-medinfo-dark-4 disabled:bg-medinfo-disabled-fill
														disabled:text-medinfo-dark-4 disabled:opacity-[initial]
														data-placeholder:text-medinfo-dark-4 md:h-[64px] md:text-base`,
														icon: `text-medinfo-body-color group-data-[state=open]:rotate-180
														md:size-6`,
													}}
												>
													<Select.Value placeholder="select language" />
												</Select.Trigger>

												<Select.Content
													classNames={{
														base: `border-[1.4px] border-medinfo-primary-main bg-white/90 p-0
														backdrop-blur-lg`,
														viewport: "gap-1",
													}}
												>
													<Select.Item
														value="English"
														className="h-[48px] bg-medinfo-light-3 font-medium
															text-medinfo-dark-4 focus:bg-medinfo-light-1
															focus:text-medinfo-body-color
															data-[state=checked]:bg-medinfo-light-1 md:h-[64px]
															md:text-base"
													>
														English
													</Select.Item>
												</Select.Content>
											</Select.Root>
										)}
									/>
								</Form.Field>
							</div>
						</article>

						<div className="flex flex-col gap-2">
							<p className="flex items-center gap-2 text-[14px] text-medinfo-dark-4">
								Appointment will be held via
								<a href="https://zoom.us" target="_blank" rel="noreferrer noopener">
									<IconBox icon="logos:zoom" className="w-14" />
								</a>
							</p>
						</div>
					</section>

					<hr className="h-[0.6px] bg-medinfo-light-1" />

					<section className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<h2 className="text-[18px] font-medium text-medinfo-dark-1 md:text-[22px]">
								Health Information
							</h2>

							<p className="text-[14px] font-normal text-medinfo-dark-4">
								This section will help the doctor prepare better for your consultation
							</p>
						</div>

						<article className="flex flex-col gap-4">
							<div className="flex flex-col gap-4 md:flex-row md:gap-[92px]">
								<Form.Field
									control={methods.control}
									name="medicalConditions"
									className="w-full gap-1 font-roboto font-medium"
								>
									<Form.Label className="md:text-[20px]">Existing medical conditions</Form.Label>

									<Form.Input
										type="textarea"
										placeholder={`write "none" if there is none`}
										className="[field-sizing:content] min-h-[180px] rounded-[8px] border-[1.4px]
											border-medinfo-primary-main px-4 py-3 placeholder:text-medinfo-dark-4
											md:py-5 md:text-base"
									/>
								</Form.Field>

								<Form.Field
									control={methods.control}
									name="allergies"
									className="w-full gap-1 font-roboto font-medium"
								>
									<Form.Label className="md:text-[20px]">Allergies</Form.Label>

									<Form.Input
										type="textarea"
										placeholder={`write "none" if there is none`}
										className="[field-sizing:content] min-h-[180px] rounded-[8px] border-[1.4px]
											border-medinfo-primary-main px-4 py-3 placeholder:text-medinfo-dark-4
											md:py-5 md:text-base"
									/>
								</Form.Field>
							</div>

							<div className="flex flex-col gap-5 md:flex-row">
								<Form.Field
									control={methods.control}
									name="healthInsurance"
									className="flex-row-reverse items-center justify-end gap-2"
								>
									<Form.Label className="md:text-[20px]">Yes, I have health insurance</Form.Label>

									<Form.Input
										type="radio"
										value="true"
										className="size-5 accent-medinfo-primary-main"
									/>
								</Form.Field>

								<Form.Field
									control={methods.control}
									name="healthInsurance"
									className="flex-row-reverse items-center justify-end gap-2"
								>
									<Form.Label className="md:text-[20px]">
										No, I don't have health insurance
									</Form.Label>

									<Form.Input
										defaultChecked={true}
										type="radio"
										value="false"
										className="size-5 accent-medinfo-primary-main"
									/>
								</Form.Field>
							</div>
						</article>
					</section>

					<hr className="h-[0.6px] bg-medinfo-light-1" />

					<section className="flex flex-col gap-4">
						<h2 className="text-[18px] font-medium text-medinfo-dark-1 md:text-[22px]">
							Consent & policies
						</h2>

						<article className="flex flex-col gap-3">
							<Form.Field
								control={methods.control}
								name="agreeToPrivacyPolicy"
								className="flex-row-reverse items-center justify-end gap-2"
							>
								<Form.Label className="md:text-[20px]">Privacy policy agreement</Form.Label>

								<Form.Input
									type="checkbox"
									value="true"
									className="size-5 shrink-0 rounded-[4px] border border-medinfo-primary-main
										accent-medinfo-primary-main"
								/>
							</Form.Field>

							<Form.Field
								control={methods.control}
								name="allowTeleMedicine"
								className="flex-row-reverse items-center justify-end gap-2"
							>
								<Form.Label className="md:text-[20px]">Consent for telemedicine</Form.Label>

								<Form.Input
									type="checkbox"
									value="false"
									className="size-5 shrink-0 rounded-[4px] border border-medinfo-primary-main
										accent-medinfo-primary-main"
								/>
							</Form.Field>

							<Form.Field
								control={methods.control}
								name="allowInfoDisclosure"
								className="flex-row-reverse items-center justify-end gap-2"
							>
								<Form.Label className="md:text-[20px]">
									Agreement to disclose medical information to appropriate healthcare
									professionals
								</Form.Label>

								<Form.Input
									type="checkbox"
									value="false"
									className="size-5 shrink-0 rounded-[4px] border border-medinfo-primary-main
										accent-medinfo-primary-main"
								/>
							</Form.Field>

							<Form.Field
								control={methods.control}
								name="allowEmailOrSMS"
								className="flex-row-reverse items-center justify-end gap-2"
							>
								<Form.Label className="md:text-[20px]">Consent to SMS/email reminders</Form.Label>

								<Form.Input
									type="checkbox"
									value="false"
									className="size-5 shrink-0 rounded-[4px] border border-medinfo-primary-main
										accent-medinfo-primary-main"
								/>
							</Form.Field>
						</article>
					</section>

					<AppointmentDialog
						formData={formData}
						onResetForm={() => {
							methods.reset();
							setFormData(null);
						}}
					/>
				</Steps.Root>
			</Form.Root>
		</Main>
	);
}

type DialogMainContentProps = {
	formData: AppointmentFormData | null;
	onResetForm: () => void;
};

function AppointmentDialog(props: DialogMainContentProps) {
	const { formData, onResetForm } = props;

	const dialogCtx = useDisclosure();

	const matchDoctorsQueryResult = useQuery(
		matchDoctorsQuery({ formData, onError: () => dialogCtx.onClose() })
	);

	const [trialCount, setTrialCount] = useState(0);

	const stepsCtx = useStepsContext();

	const matchedDoctor = matchDoctorsQueryResult.data?.selectedDoctors[trialCount];

	const [doctorId, setDoctorId] = useState("");

	const onReset = () => {
		dialogCtx.onClose();
		stepsCtx.goToPrevStep();
		onResetForm();

		setTimeout(() => setTrialCount(0), 500);
	};

	const bookAppointmentQueryResult = useQuery(
		bookAppointmentQuery({
			doctorId,
			onError: () => {
				dialogCtx.onClose();
			},
			onSuccess: () => {
				onReset();
				router.push("/patient");
			},
		})
	);

	const router = useRouter();

	const onAccept = () => {
		const matchedDoctorId = matchedDoctor?._id ?? "";

		setDoctorId(matchedDoctorId);
	};

	return (
		<Dialog.Root open={dialogCtx.isOpen} onOpenChange={dialogCtx.onToggle}>
			<div className="flex justify-center gap-6 md:justify-end">
				<Button theme="secondary">Cancel</Button>

				<Button
					type="submit"
					theme="primary"
					onClick={() => {
						dialogCtx.onOpen();
						stepsCtx.goToNextStep();
					}}
				>
					Book Now
				</Button>
			</div>

			<Dialog.Content
				onPointerDownOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={() => stepsCtx.goToPrevStep()}
				className={cnJoin(
					"flex flex-col rounded-[16px]",
					matchDoctorsQueryResult.data ?
						"max-w-[341px] gap-8 px-6 py-8 md:max-w-[650px] md:gap-9 md:px-10"
					:	"w-[292px] gap-2 pt-6 pb-[56px] md:max-w-[372px]"
				)}
				withCloseBtn={false}
			>
				<Show.Root when={matchDoctorsQueryResult.data}>
					<Show.Content>
						<StepperList className="mb-4 md:mb-6" />

						<Dialog.Header className="flex flex-col items-center gap-2">
							<figure className="flex flex-col items-center gap-2">
								<Image
									src={matchedDoctor?.picture ?? (doctorAvatar as string)}
									className="size-[72px]"
									width={72}
									height={72}
									alt=""
								/>
								<figcaption className="flex items-center gap-1">
									<p className="text-medinfo-dark-3">
										Dr. {capitalize(matchedDoctor?.firstName)}{" "}
										{capitalize(matchedDoctor?.lastName)}
									</p>
									<span className="size-4">
										<IconBox
											icon="solar:verified-check-linear"
											className="size-full text-medinfo-state-success-main"
										/>
									</span>
								</figcaption>
							</figure>

							<Dialog.Title className="text-[18px] font-bold text-medinfo-dark-3">
								{capitalize(matchedDoctor?.specialty)}
							</Dialog.Title>
						</Dialog.Header>

						<Dialog.Footer className="flex flex-col items-center gap-3 md:gap-5">
							<div className="flex flex-col items-center gap-4 md:flex-row-reverse md:gap-6">
								<Button
									isLoading={bookAppointmentQueryResult.isFetching}
									disabled={bookAppointmentQueryResult.isFetching}
									isDisabled={false}
									theme="primary"
									onClick={onAccept}
								>
									Accept
								</Button>

								<Button
									unstyled={true}
									className="text-medinfo-primary-main md:text-[20px]"
									onClick={() => {
										const newCount = trialCount + 1;

										if (newCount === matchDoctorsQueryResult.data?.selectedDoctors.length) {
											onReset();

											return;
										}

										setTrialCount(newCount);
									}}
								>
									Decline & ask for rematch
								</Button>
							</div>

							<p className="text-[14px] text-medinfo-dark-4">
								You have only{" "}
								<span className="text-medinfo-dark-1">
									{Number(matchDoctorsQueryResult.data?.selectedDoctors.length) - 1 - trialCount}
								</span>{" "}
								rematches left
							</p>
						</Dialog.Footer>
					</Show.Content>

					<Show.Fallback>
						<Dialog.Close className="self-end" asChild={true}>
							<Steps.PrevTrigger>
								<CloseIcon />
							</Steps.PrevTrigger>
						</Dialog.Close>

						<Dialog.Header className="items-center gap-8">
							<GreenSpinnerIcon className="animate-spin md:size-[100px]" />
							<Dialog.Title
								className="text-center text-base font-normal text-medinfo-dark-4 md:px-4"
							>
								Matching you to a doctor, please hold on.
							</Dialog.Title>
						</Dialog.Header>
					</Show.Fallback>
				</Show.Root>
			</Dialog.Content>
		</Dialog.Root>
	);
}

function StepperList(props: { className?: string }) {
	const { className } = props;
	const [For] = getElementList();

	return (
		<Steps.List className={cnMerge("flex justify-center", className)} asChild={true}>
			<For
				each={stepperItems}
				renderItem={(item, index) => (
					<Steps.Item key={index} index={index} className="flex items-center">
						{index !== 0 && (
							<Steps.Separator
								className="h-[2px] w-[82px] bg-medinfo-light-2 data-current:bg-medinfo-primary-main
									md:h-1 md:w-[200px]"
							/>
						)}

						<Steps.Trigger className="relative flex flex-col items-center">
							<Steps.Indicator
								className="flex size-6 items-center justify-center rounded-full border-[1.4px]
									border-[hsl(150,20%,95%)] bg-[hsl(150,20%,95%)] text-[10px]
									text-medinfo-secondary-darker data-complete:border-medinfo-primary-main
									data-complete:text-medinfo-primary-main data-current:border-medinfo-primary-main
									data-current:text-medinfo-primary-main md:size-12 md:text-[20px]"
							>
								{index + 1}
							</Steps.Indicator>

							<span
								className="absolute top-[calc(--spacing(6)+2px)] text-[10px] text-nowrap
									text-medinfo-dark-3 italic md:top-[calc(--spacing(12)+2px)] md:text-[14px]"
							>
								{item.title}
							</span>
						</Steps.Trigger>
					</Steps.Item>
				)}
			/>
		</Steps.List>
	);
}

export default AppointmentPage;
