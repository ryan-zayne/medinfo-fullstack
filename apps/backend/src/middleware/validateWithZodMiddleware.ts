import { getValidatedValue } from "@/lib/utils";
import type { ValidationTargets } from "hono";
import { validator } from "hono/validator";
import type { z } from "zod";

export const validateWithZodMiddleware = <
	TTarget extends keyof ValidationTargets,
	TSchema extends z.ZodType,
>(
	target: TTarget,
	schema: TSchema
) => {
	return validator(target, (value) => {
		const validatedValue = getValidatedValue(value, schema, target);

		return validatedValue;
	});
};
