// import { consola } from "consola";
import * as nodemailer from "nodemailer";
import { ENVIRONMENT } from "@/config/env";

// import { ENVIRONMENT } from "@/config/env";

// type EmailOptions = {
// 	data: WelcomeEmailData;
// 	type: "welcomeEmail";
// };

const transporter = nodemailer.createTransport({
	auth: {
		pass: ENVIRONMENT.EMAIL_APP_PASSWORD,
		user: ENVIRONMENT.EMAIL_USER,
	},
	host: "smtp.gmail.com",
	secure: true,
	service: "Gmail",
});

// export const sendEmail = async (options: EmailOptions) => {
// 	const { data, type } = options;

// 	// eslint-disable-next-line security/detect-object-injection
// 	const templateOptions = TEMPLATES_LOOKUP[type];

// 	try {
// 		await transporter.sendMail({
// 			from: templateOptions.from,
// 			html: templateOptions.template(data),
// 			subject: templateOptions.subject,
// 			to: data.to,
// 		});
// 	} catch (error) {
// 		consola.error(error);
// 	}
// };
