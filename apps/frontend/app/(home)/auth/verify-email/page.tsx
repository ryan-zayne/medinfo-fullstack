"use client";

import { useRouter } from "@bprogress/next";
import { zodResolver } from "@hookform/resolvers/zod";
import { backendApiSchemaRoutes } from "@medinfo/shared/validation/backendApiSchema";
import { useMutation } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Fragment, use } from "react";
import { useForm } from "react-hook-form";
import { For, IconBox, Logo, NavLink } from "@/components/common";
import { Button, Form, InputOTP } from "@/components/ui";
import { callBackendApiForQuery } from "@/lib/api/callBackendApi";
import { resendVerificationEmailMutation } from "@/lib/react-query/mutationOptions";
import { Main } from "../../-components";

const VerifyEmailSchema = backendApiSchemaRoutes["@post/auth/verify-email"].body.pick({ code: true });

function VerifyEmailPage(props: PageProps<"/auth/verify-email">) {
	const { searchParams: searchParamsPromise } = props;

	const searchParams = use(searchParamsPromise);
	const router = useRouter();

	const email = (searchParams.email ?? "") as string;
	const code = (searchParams.code ?? "") as string;

	const form = useForm({
		defaultValues: {
			code,
		},
		mode: "onTouched",
		resolver: zodResolver(VerifyEmailSchema),
	});

	const { control } = form;

	const onSubmit = form.handleSubmit(async (data) => {
		await callBackendApiForQuery("@post/auth/verify-email", {
			body: { ...data, email },
			meta: { toast: { success: true } },

			onSuccess: (ctx) => {
				router.push(`/dashboard/${ctx.data.data.user.role}`);
			},
		});
	});

	const resendCodeMutationResult = useMutation(resendVerificationEmailMutation());

	const handleResendCode = () => {
		resendCodeMutationResult.mutate({ email });
	};

	return (
		<Main className="w-full max-md:max-w-[400px] md:flex md:flex-col md:items-center md:px-6">
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
							Verify Your Email
						</h1>

						<p className="text-center text-[14px] text-medinfo-dark-2 md:text-[18px]">
							We've sent a 6-digit verification code to{" "}
							<span className="font-medium text-medinfo-primary-main">{email}</span>
						</p>

						<Form.Root
							form={form}
							className="w-full gap-6"
							onSubmit={(event) => void onSubmit(event)}
						>
							<Form.Field
								control={control}
								name="code"
								className="flex flex-col items-center gap-4"
							>
								<Form.Label className="text-center text-[16px] font-medium md:text-[20px]">
									Enter verification code
								</Form.Label>

								<Form.FieldBoundController
									render={({ field }) => (
										<InputOTP.Root
											pattern={REGEXP_ONLY_DIGITS}
											maxLength={6}
											value={field.value}
											onChange={field.onChange}
											classNames={{
												container: "gap-3 md:gap-4",
											}}
										>
											<InputOTP.Group className="gap-1">
												<For
													each={6}
													renderItem={(index) => (
														<Fragment key={index}>
															<InputOTP.Slot
																index={index}
																classNames={{
																	base: "size-10 rounded-[4px] text-base",
																	isActive: "ring-medinfo-primary-lighter",
																}}
															/>
															{index === 2 && <InputOTP.Separator />}
														</Fragment>
													)}
												/>
											</InputOTP.Group>
										</InputOTP.Root>
									)}
								/>

								<Form.ErrorMessage />
							</Form.Field>

							<article className="flex flex-col items-center gap-8 md:gap-6">
								<Form.StateSubscribe
									render={(formState) => (
										<Button
											type="submit"
											size="large"
											isLoading={formState.isSubmitting}
											disabled={formState.isSubmitting}
										>
											Verify Email
										</Button>
									)}
								/>

								<div className="flex flex-col items-center gap-2 text-center">
									<p className="text-[14px] text-medinfo-dark-2 md:text-[16px]">
										Didn't receive the code?
									</p>
									<Button
										theme="primary-ghost"
										isLoading={resendCodeMutationResult.isPending}
										disabled={resendCodeMutationResult.isPending}
										onClick={handleResendCode}
									>
										Resend Code
									</Button>
								</div>

								<p className="md:hidden">
									Remember your password?{" "}
									<NavLink
										transitionType="regular"
										href="/auth/signin"
										className="text-medinfo-primary-main"
									>
										Sign in
									</NavLink>
								</p>

								<div className="mt-6 flex flex-col gap-4">
									<figure className="flex items-center gap-2 text-[14px] text-medinfo-dark-2">
										<IconBox icon="tabler:circle-check" className="size-4" />
										<figcaption>Check your spam folder</figcaption>
									</figure>
									<figure className="flex items-center gap-2 text-[14px] text-medinfo-dark-2">
										<IconBox icon="tabler:circle-check" className="size-4" />
										<figcaption>Code expires in 15 minutes</figcaption>
									</figure>
									<figure className="flex items-center gap-2 text-[14px] text-medinfo-dark-2">
										<IconBox icon="tabler:circle-check" className="size-4" />
										<figcaption>Keep this page open</figcaption>
									</figure>
								</div>
							</article>
						</Form.Root>
					</div>
				</section>

				<aside
					className="flex w-[432px] flex-col items-center justify-center rounded-r-[16px]
						bg-medinfo-primary-main px-[35px] text-center text-white max-md:hidden xl:shrink-0"
				>
					<div className="flex size-20 items-center justify-center rounded-full bg-white/20">
						<IconBox icon="tabler:mail" className="size-10 text-white" />
					</div>

					<h2 className="mt-6 text-[32px] font-semibold">Check Your Email</h2>

					<p className="mt-6 text-[18px]">
						We've sent a verification code to your email address. Please check your inbox and enter
						the code to verify your account.
					</p>

					<Button theme="secondary-ghost" className="mt-9.5" asChild={true}>
						<NavLink href="/auth/signin">Back to Sign in</NavLink>
					</Button>
				</aside>
			</div>
		</Main>
	);
}

export default VerifyEmailPage;
