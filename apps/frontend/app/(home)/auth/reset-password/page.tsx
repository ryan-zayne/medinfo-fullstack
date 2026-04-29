"use client";

import { useRouter } from "@bprogress/next";
import { zodResolver } from "@hookform/resolvers/zod";
import { use } from "react";
import { useForm } from "react-hook-form";
import { Logo } from "@/app/-components/Logo";
import { IconBox } from "@/components/common/IconBox";
import { NavLink } from "@/components/common/NavLink";
import { Button, Form } from "@/components/ui";
import { callBackendApiForQuery } from "@/lib/api/callBackendApi";
import { backendApiSchemaRoutes } from "@/lib/api/callBackendApi/apiSchema";
import { Main } from "../../-components";

const ResetPasswordSchema = backendApiSchemaRoutes["@post/auth/reset-password"].body;

function ResetPasswordPage(props: PageProps<"/auth/reset-password">) {
	const { searchParams: searchParamsPromise } = props;

	const searchParams = use(searchParamsPromise);
	const router = useRouter();

	const token = (searchParams.token ?? "") as string;

	const form = useForm({
		defaultValues: {
			confirmNewPassword: "",
			newPassword: "",
			token,
		},
		resolver: zodResolver(ResetPasswordSchema),
	});

	const { control } = form;

	const onSubmit = form.handleSubmit(async (data) => {
		await callBackendApiForQuery("@post/auth/reset-password", {
			body: data,
			meta: { toast: { success: true } },

			onSuccess: () => {
				router.push("/auth/signin");
			},
		});
	});

	return (
		<Main className="w-full max-md:max-w-[400px] md:flex md:flex-col md:items-center md:px-6">
			<div
				className="w-full rounded-[16px] border-[1.4px] border-medinfo-light-2
					shadow-[0_0_0_2px_hsl(0,0%,0%,0.25)] md:flex md:max-w-fit"
			>
				<section
					className="m-6 md:mx-[93px] md:my-11 md:flex md:w-full md:max-w-[460px] md:flex-col
						md:items-center"
				>
					<Logo className="max-lg:h-[46px] max-lg:w-[60px]" />

					<div className="mt-3 flex flex-col items-center gap-8 md:w-max">
						<h1
							className="text-center text-[24px]/8 font-semibold text-medinfo-primary-darker
								md:max-w-[375px] md:text-[48px]/14 md:font-bold"
						>
							Reset Password
						</h1>

						<p className="text-center text-medinfo-dark-4 md:text-lg">
							Please enter your new password below to regain access to your account.
						</p>

						<Form.Root
							form={form}
							className="w-full gap-4"
							onSubmit={(event) => void onSubmit(event)}
						>
							<Form.Field
								control={control}
								name="newPassword"
								className="gap-1 font-roboto font-medium"
							>
								<Form.Label className="md:text-[20px]">New Password</Form.Label>

								<Form.InputGroup
									className="h-12 gap-4 rounded-[8px] border-[1.4px] border-medinfo-primary-main
										px-4 py-3 md:h-[64px] md:py-5"
								>
									<Form.InputLeftItem className="size-5 md:size-6">
										<IconBox icon="mynaui:lock-password" className="size-full" />
									</Form.InputLeftItem>

									<Form.Input
										type="password"
										placeholder="enter new password"
										className="placeholder:text-medinfo-dark-4 md:text-base"
									/>
								</Form.InputGroup>

								<Form.ErrorMessage />
							</Form.Field>

							<Form.Field
								control={control}
								name="confirmNewPassword"
								className="gap-1 font-roboto font-medium"
							>
								<Form.Label className="md:text-[20px]">Confirm New Password</Form.Label>

								<Form.InputGroup
									className="h-12 gap-4 rounded-[8px] border-[1.4px] border-medinfo-primary-main
										px-4 py-3 md:h-[64px] md:py-5"
								>
									<Form.InputLeftItem className="size-5 md:size-6">
										<IconBox icon="mynaui:lock-password" className="size-full" />
									</Form.InputLeftItem>

									<Form.Input
										type="password"
										placeholder="confirm your new password"
										className="placeholder:text-medinfo-dark-4 md:text-base"
									/>
								</Form.InputGroup>

								<Form.ErrorMessage />
							</Form.Field>

							<article className="mt-4 flex flex-col items-center gap-4">
								<Form.StateSubscribe
									render={(formState) => (
										<Button
											type="submit"
											isLoading={formState.isSubmitting}
											disabled={formState.isSubmitting}
										>
											Update Password
										</Button>
									)}
								/>

								<NavLink
									transitionType="regular"
									href="/auth/signin"
									className="text-medinfo-primary-main md:text-[18px]"
								>
									Cancel and Return to Sign in
								</NavLink>
							</article>
						</Form.Root>
					</div>
				</section>

				<aside
					className="flex max-w-[432px] flex-col items-center justify-center rounded-r-[16px]
						bg-medinfo-primary-main px-9 text-center text-white max-md:hidden xl:shrink-0"
				>
					<h2 className="text-[32px] font-semibold">Security First</h2>

					<p className="mt-6 text-[18px]">
						Choose a strong password to keep your medical information safe and secure.
					</p>

					<div className="mt-8 flex size-24 items-center justify-center rounded-full bg-white/20">
						<IconBox icon="solar:shield-keyhole-bold-duotone" className="size-12" />
					</div>
				</aside>
			</div>
		</Main>
	);
}

export default ResetPasswordPage;
