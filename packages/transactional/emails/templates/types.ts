import type { TEMPLATE_LOOKUP } from "./lookup";
import type { VerifyEmailProps } from "./verify-email";
import type { WelcomeEmailProps } from "./welcome-email";

type WithCommonFields<TObject extends Record<string, unknown>> = TObject & {
	priority?: "high" | "low";
	to: string;
};

type SatisfiesEmailJobOptionsType<
	TJobOptions extends {
		data: WithCommonFields<
			Parameters<(typeof TEMPLATE_LOOKUP)[keyof typeof TEMPLATE_LOOKUP]["template"]>[0]
		>;
		type: keyof typeof TEMPLATE_LOOKUP;
	},
> = TJobOptions;

export type EmailJobOptions = SatisfiesEmailJobOptionsType<
	| {
			data: WithCommonFields<VerifyEmailProps>;
			type: "verifyEmail";
	  }
	| {
			data: WithCommonFields<WelcomeEmailProps>;
			type: "welcomeEmail";
	  }
>;
