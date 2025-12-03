"use client";

import { IconBox, NavLink } from "@/components/common";
import { Button, Form } from "@/components/ui";
import { cnJoin } from "@/lib/utils/cn";
import { useState } from "react";
import { Main } from "../-components";

function ForgotPasswordPage() {
	const [resetMode, setResetMode] = useState<"email" | "sms">("email");

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

				<form
					onSubmit={(event) => {
						event.preventDefault();
					}}
					onChange={(event) => {
						const radio = event.target as HTMLInputElement;

						setResetMode(radio.value as typeof resetMode);
					}}
				>
					<Form.Field name="resetMode" className="gap-4">
						<Form.InputGroup
							className="relative justify-normal gap-6 rounded-[12px] border-2
								border-medinfo-primary-main p-3 md:p-6"
						>
							<Form.InputLeftItem
								className={cnJoin(
									"size-9 rounded-full md:size-11",
									resetMode === "email" ? "bg-medinfo-primary-subtle" : "bg-medinfo-light-4"
								)}
							>
								<IconBox icon="mynaui:envelope" className="size-[18px] md:size-6" />
							</Form.InputLeftItem>

							<Form.InputPrimitive
								value="email"
								type="radio"
								className="absolute inset-0 appearance-none"
							/>

							<div className="max-w-[185px]">
								<h3 className="text-[18px] font-medium text-medinfo-primary-darker">
									Reset via Email
								</h3>

								<p className="text-sm text-medinfo-dark-4">
									Link will be sent to your registered email
								</p>
							</div>

							{resetMode === "email" && (
								<Form.InputRightItem
									className="ml-auto size-6 rounded-full bg-medinfo-primary-main"
								>
									<IconBox icon="mdi:check-bold" className="size-3 text-white" />
								</Form.InputRightItem>
							)}
						</Form.InputGroup>

						<Form.InputGroup
							className="relative justify-normal gap-6 rounded-[12px] border-2
								border-medinfo-primary-main p-3 md:p-6"
						>
							<Form.InputLeftItem
								className={cnJoin(
									"size-9 rounded-full md:size-11",
									resetMode === "sms" ? "bg-medinfo-primary-subtle" : "bg-medinfo-light-4"
								)}
							>
								<IconBox icon="bi:telephone" className="size-[18px]" />
							</Form.InputLeftItem>

							<Form.InputPrimitive
								value="sms"
								type="radio"
								className="absolute inset-0 appearance-none"
							/>

							<div className="max-w-[185px]">
								<h3 className="text-[18px] font-medium text-medinfo-primary-darker">
									Reset via SMS
								</h3>

								<p className="text-sm text-medinfo-dark-4">
									Link will be sent to your registered phone number
								</p>
							</div>

							{resetMode === "sms" && (
								<Form.InputRightItem
									className="ml-auto size-6 rounded-full bg-medinfo-primary-main"
								>
									<IconBox icon="mdi:check-bold" className="size-3 text-white" />
								</Form.InputRightItem>
							)}
						</Form.InputGroup>
					</Form.Field>

					<div className="mt-8 flex flex-col items-center gap-5">
						<Button type="submit">Get link</Button>
						<NavLink
							href="#"
							transitionType="regular"
							className="text-[20px] font-medium text-medinfo-primary-main"
						>
							Resend link
						</NavLink>
					</div>
				</form>
			</section>
		</Main>
	);
}
export default ForgotPasswordPage;
