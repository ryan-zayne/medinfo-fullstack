import { consola } from "consola";
import type { NotFoundHandler } from "hono";
import type { BlankEnv } from "hono/types";

const notFoundHandler: NotFoundHandler<BlankEnv> = (ctx) => {
	const message = `No '${ctx.req.method.toUpperCase()}' handler defined for '${ctx.req.path}'. Check the API documentation for more details.`;

	consola.error(`NotFound: ${message}`);

	// eslint-disable-next-line perfectionist/sort-objects
	return ctx.json({ status: "error", message }, 404);
};

export { notFoundHandler };
