import { z } from "zod";

export const sharedEnvSchema = z.object({
	BASE_BACKEND_HOST: z
		.literal(["https://api-medical-info.vercel.app", "https://api-medical-info.onrender.com"])
		.default("https://api-medical-info.vercel.app"),
	BASE_BACKEND_HOST_DEV: z.literal("http://localhost:8000").default("http://localhost:8000"),
	BASE_FRONTEND_HOST: z
		.literal("https://medical-info.vercel.app")
		.default("https://medical-info.vercel.app"),
	BASE_FRONTEND_HOST_DEV: z.literal("http://localhost:3000").default("http://localhost:3000"),
});
