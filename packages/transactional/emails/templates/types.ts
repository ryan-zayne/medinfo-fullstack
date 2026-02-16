import type { Awaitable } from "@zayne-labs/toolkit-type-helpers";
import type { TEMPLATE_LOOKUP } from "./lookup";
import type { VerifyEmailProps } from "./VerifyEmail";
import type { WelcomeEmailProps } from "./WelcomeEmail";

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
	{
		onError?: () => Awaitable<void>;
		onSuccess?: () => Awaitable<void>;
	} & (
		| {
				data: WithCommonFields<VerifyEmailProps>;
				type: "verifyEmail";
		  }
		| {
				data: WithCommonFields<WelcomeEmailProps>;
				type: "welcomeEmail";
		  }
	)
>;
