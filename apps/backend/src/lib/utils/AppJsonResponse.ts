import type { BackendApiSchemaRoutes, RouteSchemaKeys } from "@medinfo/shared/validation/backendApiSchema";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { z } from "zod";
import { getValidatedValue } from "./validation";

const AppJsonResponse = <
	TSchema extends Extract<BackendApiSchemaRoutes[RouteSchemaKeys], { data: z.ZodObject }>,
	TDataSchema extends TSchema["data"]["shape"]["data"],
>(
	ctx: Context,
	extra: {
		code?: ContentfulStatusCode;
		data: z.infer<TDataSchema>;
		message: string;
		schema: TSchema;
	}
) => {
	const { code: statusCode = 200, data, message, schema } = extra;

	const validatedData = getValidatedValue(data, schema.data.shape.data as TDataSchema, "data");

	/* eslint-disable perfectionist/sort-objects */
	const jsonBody = {
		status: "success",
		message,
		data: validatedData,
	};
	/* eslint-enable perfectionist/sort-objects */

	return ctx.json(jsonBody, statusCode);
};

export { AppJsonResponse };
