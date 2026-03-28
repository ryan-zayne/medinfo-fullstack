import type { InferProps } from "@zayne-labs/toolkit-react/utils";
import { defineEnumDeep, type AnyFunction } from "@zayne-labs/toolkit-type-helpers";

type TemplateType = Record<
	string,
	{
		from: string;
		subject: string;
		template: (props: never) => Promise<string>;
	}
>;

type Module = {
	TemplateFn: AnyFunction<Promise<string>>;
};

const getTemplateFn =
	<TModule extends Module>(funcPromise: Promise<TModule>) =>
	async (props: InferProps<TModule["TemplateFn"]>) => {
		const func = await funcPromise;

		return func.TemplateFn(props);
	};

export const TEMPLATE_LOOKUP = defineEnumDeep(
	{
		resetPassword: {
			from: "MedInfo <donotreply@medical-info.com>",
			subject: "Reset your password",
			template: getTemplateFn(import("./ResetPasswordEmail")),
		},
		verifyEmail: {
			from: "MedInfo <donotreply@medical-info.com>",
			subject: "Verify your email address",
			template: getTemplateFn(import("./VerifyEmail")),
		},
		welcomeEmail: {
			from: "MedInfo <donotreply@medical-info.com>",
			subject: "Welcome to MedInfo",
			template: getTemplateFn(import("./WelcomeEmail")),
		},
	},
	{ inferredUnionVariant: "none" }
) satisfies TemplateType;
