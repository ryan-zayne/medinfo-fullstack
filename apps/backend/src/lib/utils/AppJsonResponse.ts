import {
	backendApiSchemaRoutes,
	type BackendApiSchemaRoutes,
	type RouteSchemaKeys,
} from "@medinfo/shared/validation/backendApiSchema";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { z } from "zod";
import { getValidatedValue } from "./validation";

const AppJsonResponse = async <TRouteSchemaKey extends RouteSchemaKeys>(
	ctx: Context,
	extra: {
		code?: ContentfulStatusCode;
		data: z.infer<BackendApiSchemaRoutes[TRouteSchemaKey]["data"]["shape"]["data"]>;
		message: string;
		routeSchemaKey?: TRouteSchemaKey;
	}
) => {
	const { code: statusCode = 200, data, message, routeSchemaKey } = extra;

	const routeSchema = routeSchemaKey && backendApiSchemaRoutes[routeSchemaKey];

	const validatedData = await getValidatedValue(data, routeSchema?.data.shape.data, "data");

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
