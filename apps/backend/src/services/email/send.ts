import { TEMPLATE_LOOKUP, type EmailJobOptions } from "@medinfo/transactional/emails/templates";
import type { CallbackFn } from "@zayne-labs/toolkit-type-helpers";
import { consola } from "consola";
import * as nodemailer from "nodemailer";
import { ENVIRONMENT } from "@/config/env";
import { pinoLogger } from "@/middleware/pinoLogger";

const transporter = nodemailer.createTransport({
	auth: {
		pass: ENVIRONMENT.EMAIL_APP_PASSWORD,
		user: ENVIRONMENT.EMAIL_USER,
	},
	host: "smtp.gmail.com",
	secure: true,
	service: "Gmail",
});

export const sendEmail = async (options: EmailJobOptions) => {
	const { data, type } = options;

	const templateOptions = TEMPLATE_LOOKUP[type];

	const templateFn = templateOptions.template as CallbackFn<
		Parameters<typeof templateOptions.template>[0],
		ReturnType<typeof templateOptions.template>
	>;

	try {
		await transporter.sendMail({
			from: templateOptions.from,
			html: await templateFn(data),
			subject: templateOptions.subject,
			to: data.to,
		});
	} catch (error) {
		const message = `Failed to deliver '${type}' email to '${data.to}'`;

		consola.error(message, error);

		pinoLogger.error({
			cause: error,
			message,
		});
	}
};
