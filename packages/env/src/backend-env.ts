import * as dotenvx from "@dotenvx/dotenvx";
import { consola } from "consola";
import { z } from "zod";
import { evaluateString } from "./utils/common";
import { resolvePathToCwd } from "./utils/url";

const stringBoolean = z.stringbool({ falsy: ["false"], truthy: ["true"] });

export const envSchema = z.object({
	ACCESS_JWT_EXPIRES_IN: z.string().transform((value) => evaluateString<number>(value)),
	ACCESS_SECRET: z.string(),
	BASE_BACKEND_HOST: z.url(),
	BASE_BACKEND_HOST_DEV: z.literal("http://localhost:8000").default("http://localhost:8000"),
	BASE_FRONTEND_HOST: z.url(),
	BASE_FRONTEND_HOST_DEV: z.literal("http://localhost:3000").default("http://localhost:3000"),
	CLOUDINARY_API_KEY: z.string(),
	CLOUDINARY_API_SECRET: z.string(),
	CLOUDINARY_CLOUD_NAME: z.string(),
	DATABASE_URL: z.string(),
	DATABASE_URL_DEV: z
		.literal("postgresql://postgres:postgres@localhost:5432/medinfo")
		.default("postgresql://postgres:postgres@localhost:5432/medinfo"),
	DB_MIGRATING: stringBoolean.default(false),
	DB_SEEDING: stringBoolean.default(false),
	EMAIL_APP_PASSWORD: z.string(),
	EMAIL_APP_PASSWORD_DEV: z.literal("RwRhRUYeranPd4caCS").default("RwRhRUYeranPd4caCS"),
	EMAIL_USER: z.email(),
	EMAIL_USER_DEV: z.literal("bella.schroeder@ethereal.email").default("bella.schroeder@ethereal.email"),
	GOOGLE_AUTH_API_KEY: z.string(),
	GOOGLE_CLIENT_ID: z.string(),
	GOOGLE_CLIENT_SECRET: z.string(),
	LOG_LEVEL: z.literal(["debug", "info", "warn", "error", "fatal", "silent"]).default("info"),
	NODE_ENV: z.literal(["development", "production"]).default("development"),
	PORT: z.coerce.number().default(8000),
	REDIS_CACHE_URL: z.url(),
	REDIS_CACHE_URL_DEV: z
		.literal(["redis://localhost:6381", "redis://medinfo-redis-cache:6379"])
		.default("redis://localhost:6381"),
	REDIS_QUEUE_URL: z.url(),
	REDIS_QUEUE_URL_DEV: z
		.literal(["redis://localhost:6382", "redis://medinfo-redis-queue:6379"])
		.default("redis://localhost:6382"),
	REFRESH_JWT_EXPIRES_IN: z.string().transform((value) => evaluateString<number>(value)),
	REFRESH_SECRET: z.string(),
	SEED_PASSWORD: z.string(),
	ZOOM_ACCOUNT_ID: z.string(),
	ZOOM_CLIENT_ID: z.string(),
	ZOOM_CLIENT_SECRET: z.string(),
});

dotenvx.config({
	path: resolvePathToCwd("/apps/backend/.env"),
});

export const getBackendEnv = () => {
	// eslint-disable-next-line node/no-process-env
	const result = envSchema.safeParse(process.env);

	if (!result.success) {
		const missingKeys = Object.keys(z.flattenError(result.error).fieldErrors);

		const errorMessage = `Missing required environment variable(s):\n → ${missingKeys.join("\n → ")}`;

		const error = new Error(errorMessage, { cause: z.flattenError(result.error).fieldErrors });

		error.stack = "";

		consola.error(error);

		throw error;
	}

	return result.data;
};
