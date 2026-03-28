import { Button, Heading, Hr, render, Section, Text } from "@react-email/components";
import * as React from "react";
import { FRONTEND_URL } from "../constants";
import { BaseLayout } from "../layouts/BaseLayout";

export type PasswordResetCompleteEmailProps = {
	name: string;
};

export function PasswordResetCompleteEmail(props: PasswordResetCompleteEmailProps) {
	const { name } = props;

	const loginURL = `${FRONTEND_URL}/auth/signin`;
	const supportURL = `${FRONTEND_URL}/support`;

	return (
		<BaseLayout preview="Your password has been successfully reset">
			<Heading
				className="mb-6 text-center text-2xl font-semibold tracking-tight text-medinfo-primary-main"
			>
				Password Reset Successful
			</Heading>

			<Text className="mb-4 text-base/relaxed text-medinfo-body-color">
				Hello <span className="font-semibold text-medinfo-primary-darker">{name}</span>,
			</Text>

			<Text className="mb-6 text-base/relaxed text-medinfo-body-color">
				Your password has been successfully reset. You can now sign in to your account using your new
				password.
			</Text>

			<Section className="my-8 text-center">
				<Button
					className="inline-block rounded-full bg-medinfo-primary-main px-10 py-4 text-sm
						font-semibold text-white no-underline shadow-md"
					href={loginURL}
				>
					Sign In to Your Account
				</Button>
			</Section>

			<Hr className="my-6 border-medinfo-light-2" />

			<Section className="rounded-lg bg-medinfo-secondary-subtle p-4">
				<Text className="mb-2 text-sm font-semibold text-medinfo-primary-darker">
					Security Reminder
				</Text>
				<Text className="mb-0 text-sm/relaxed text-medinfo-dark-4">
					If you did not request this password reset, please contact our support team immediately.
					Your account security is important to us.
				</Text>
			</Section>

			<Text className="mt-6 mb-0 text-sm/relaxed text-medinfo-dark-4">
				Need help? Visit our{" "}
				<Button className="text-medinfo-primary-main underline" href={supportURL}>
					Help Center
				</Button>{" "}
				or reply to this email.
			</Text>
		</BaseLayout>
	);
}

PasswordResetCompleteEmail.PreviewProps = {
	name: "John Doe",
} satisfies PasswordResetCompleteEmailProps;

export const TemplateFn = (props: PasswordResetCompleteEmailProps) =>
	render(<PasswordResetCompleteEmail {...props} />);

export default PasswordResetCompleteEmail;
