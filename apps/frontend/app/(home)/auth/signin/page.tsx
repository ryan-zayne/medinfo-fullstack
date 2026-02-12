"use client";

import { useRouter } from "@bprogress/next";
import { zodResolver } from "@hookform/resolvers/zod";
import { use } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { IconBox, Logo, NavLink, Show } from "@/components/common";
import { Button, Form } from "@/components/ui";
import { callBackendApiForQuery } from "@/lib/api/callBackendApi";
import { backendApiSchemaRoutes, type SignUpSchema } from "@/lib/api/callBackendApi/apiSchema";
import { Main } from "../../-components";
import { OAuthSection } from "../OAuthSection";

const SignInSchema = backendApiSchemaRoutes["@post/auth/signin"].body;

function SignInPage(props: PageProps<"/auth/signin">) {
	const { searchParams: searchParamsPromise } = props;

	const searchParams = use(searchParamsPromise);

	const userRole = (searchParams.user as z.infer<typeof SignUpSchema>["role"] | undefined) ?? "patient";

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		resolver: zodResolver(SignInSchema),
	});

	const { control } = form;

	const router = useRouter();

	const onSubmit = form.handleSubmit(async (data) => {
		await callBackendApiForQuery("@post/auth/signin", {
			body: data,
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

					<div className="mt-3 flex flex-col items-center gap-8 md:w-max">
						<h1
							className="max-w-[186px] text-center text-[24px]/8 font-semibold
								text-medinfo-primary-darker md:mx-[42px] md:max-w-[375px] md:text-[48px]/14
								md:font-bold"
						>
							Sign in to MedInfo Nigeria
						</h1>

						<Form.Root
							form={form}
							className="w-full gap-3.5"
							onSubmit={(event) => void onSubmit(event)}
						>
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

								<NavLink
									href="/auth/forgot-password"
									className="mt-1 self-end font-work-sans text-medinfo-primary-main"
								>
									Forgot password?
								</NavLink>
							</Form.Field>

							<article className="flex flex-col items-center gap-3.5 md:mt-3.5 md:gap-7">
								<Show.Root when={userRole === "patient"}>
									<OAuthSection userRole={userRole} />
								</Show.Root>

								<Form.StateSubscribe
									render={(formState) => (
										<Button
											type="submit"
											isLoading={formState.isSubmitting}
											disabled={formState.isSubmitting}
										>
											Sign In
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
										{userRole === "doctor" ? "Sign in as a patient" : "Sign in as a doctor"}
									</NavLink>

									<p className="md:hidden">
										Don't have an account?{" "}
										<NavLink
											transitionType="regular"
											href={{
												pathname: "/auth/signup",
												query: { user: userRole === "doctor" ? "doctor" : "patient" },
											}}
											className="text-medinfo-primary-main"
										>
											Sign up
										</NavLink>
									</p>
								</div>
							</article>
						</Form.Root>
					</div>
				</section>

				<section
					className="flex max-w-[432px] flex-col items-center justify-center rounded-r-[16px]
						bg-medinfo-primary-main px-[35px] text-center text-white max-md:hidden xl:shrink-0"
				>
					<h2 className="text-[32px] font-semibold">Welcome friend!</h2>

					<p className="mt-6 text-[18px]">Enter in your details and lets get you started</p>

					<Button theme="secondary-ghost" className="mt-[38px]" asChild={true}>
						<NavLink
							href={{
								pathname: "/auth/signup",
								query: { user: userRole === "doctor" ? "doctor" : "patient" },
							}}
						>
							Sign up
						</NavLink>
					</Button>
				</section>
			</div>
		</Main>
	);
}

export default SignInPage;
