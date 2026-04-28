"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { IconBox } from "@/components/common/IconBox";
import { NavLink } from "@/components/common/NavLink";
import { Switch } from "@/components/common/switch";
import { Button, Form } from "@/components/ui";
import { callBackendApiForQuery } from "@/lib/api/callBackendApi";
import { backendApiSchemaRoutes } from "@/lib/api/callBackendApi/apiSchema";
import { cnJoin } from "@/lib/utils/cn";
import { Main } from "../../-components";

const ForgotPasswordSchema = backendApiSchemaRoutes["@post/auth/forgot-password"].body.extend({
	resetMode: z.literal(["email", "sms"]).optional(),
});

function ForgotPasswordPage() {
	const form = useForm({
		defaultValues: {
			email: "",
			resetMode: "email",
		},
		resolver: zodResolver(ForgotPasswordSchema),
	});

	const { control } = form;

	const onSubmit = form.handleSubmit(async (data) => {
		await callBackendApiForQuery("@post/auth/forgot-password", {
			body: {
				email: data.email,
			},
			meta: { toast: { success: true } },
		});
	});

	return (
		<Main className="flex justify-center md:w-full">
			<section
				className="flex max-w-[524px] flex-col gap-5 rounded-[16px] border-[1.4px]
					border-medinfo-light-2 p-6 shadow-[0_0_0_2px_hsl(0,0%,0%,0.25)] md:p-9"
			>
				<div className="flex flex-col gap-3 text-center">
					<h1 className="text-[22px] font-medium text-medinfo-primary-darker">Forgot Password</h1>
					<p className="text-medinfo-dark-4">Select an option to send a link reset password</p>
				</div>

				<Form.Root form={form} onSubmit={(event) => void onSubmit(event)}>
					<Form.Field control={control} name="resetMode" className="gap-4">
						<Form.InputGroup
							className="relative justify-normal gap-6 rounded-xl border-2
								border-medinfo-primary-main p-3 md:p-6"
						>
							<Form.Watch
								render={(resetMode) => (
									<Form.InputLeftItem
										className={cnJoin(
											"size-9 rounded-full md:size-11",
											resetMode === "email" ? "bg-medinfo-primary-subtle" : "bg-medinfo-light-4"
										)}
									>
										<IconBox icon="mynaui:envelope" className="size-4.5 md:size-6" />
									</Form.InputLeftItem>
								)}
							/>

							<Form.Input value="email" type="radio" className="absolute inset-0 appearance-none" />

							<div className="max-w-[185px]">
								<Form.Description
									as="h3"
									className="text-[18px] font-medium text-medinfo-primary-darker"
								>
									Reset via Email
								</Form.Description>

								<p className="text-sm text-medinfo-dark-4">
									Link will be sent to your registered email
								</p>
							</div>

							<Form.Watch
								render={(resetMode) =>
									resetMode === "email" && (
										<Form.InputRightItem
											className="ml-auto size-6 rounded-full bg-medinfo-primary-main"
										>
											<IconBox icon="mdi:check-bold" className="size-3 text-white" />
										</Form.InputRightItem>
									)
								}
							/>
						</Form.InputGroup>

						<Form.InputGroup
							className="relative justify-normal gap-6 rounded-xl border-2
								border-medinfo-primary-main p-3 md:p-6"
						>
							<Form.Watch
								render={(resetMode) => (
									<Form.InputLeftItem
										className={cnJoin(
											"size-9 rounded-full md:size-11",
											resetMode === "sms" ? "bg-medinfo-primary-subtle" : "bg-medinfo-light-4"
										)}
									>
										<IconBox icon="bi:telephone" className="size-4.5" />
									</Form.InputLeftItem>
								)}
							/>

							<Form.Input value="sms" type="radio" className="absolute inset-0 appearance-none" />

							<div className="max-w-[185px]">
								<Form.Description
									as="h3"
									className="text-[18px] font-medium text-medinfo-primary-darker"
								>
									Reset via SMS
								</Form.Description>

								<p className="text-sm text-medinfo-dark-4">
									Link will be sent to your registered phone number
								</p>
							</div>

							<Form.Watch
								render={(resetMode) =>
									resetMode === "sms" && (
										<Form.InputRightItem
											className="ml-auto size-6 rounded-full bg-medinfo-primary-main"
										>
											<IconBox icon="mdi:check-bold" className="size-3 text-white" />
										</Form.InputRightItem>
									)
								}
							/>
						</Form.InputGroup>
					</Form.Field>

					<Form.Watch control={control} name="resetMode">
						{(resetMode) => (
							<Switch.Root>
								<Switch.Match when={resetMode === "email"}>
									<Form.Field
										control={control}
										name="email"
										className="mt-6 gap-1 font-roboto font-medium"
									>
										<Form.Label className="md:text-[20px]">Email Address</Form.Label>

										<Form.InputGroup
											className="h-12 gap-4 rounded-[8px] border-[1.4px]
												border-medinfo-primary-main px-4 py-3 md:h-[64px] md:py-5"
										>
											<Form.InputLeftItem className="size-5 md:size-6">
												<IconBox icon="mynaui:envelope" className="size-full" />
											</Form.InputLeftItem>

											<Form.Input
												type="email"
												placeholder="enter your email"
												className="placeholder:text-medinfo-dark-4 md:text-base"
											/>

											<Form.ErrorMessage />
										</Form.InputGroup>

										<Form.ErrorMessage />
									</Form.Field>
								</Switch.Match>

								<Switch.Match when={resetMode === "sms"}>
									<div className="mt-6 text-center text-sm text-medinfo-dark-4 italic">
										Reset via SMS is temporarily unavailable. Please use Email.
									</div>
								</Switch.Match>
							</Switch.Root>
						)}
					</Form.Watch>

					<article className="mt-8 flex flex-col items-center gap-5">
						<Form.StateSubscribe
							render={(formState) => (
								<Form.Watch control={control} name="resetMode">
									{(resetMode) => (
										<Button
											type="submit"
											disabled={resetMode === "sms" || formState.isSubmitting}
											isLoading={formState.isSubmitting}
										>
											Get link
										</Button>
									)}
								</Form.Watch>
							)}
						/>

						<NavLink
							href="/auth/signin"
							transitionType="regular"
							className="text-[20px] font-medium text-medinfo-primary-main"
						>
							Back to Sign in
						</NavLink>
					</article>
				</Form.Root>
			</section>
		</Main>
	);
}

export default ForgotPasswordPage;
