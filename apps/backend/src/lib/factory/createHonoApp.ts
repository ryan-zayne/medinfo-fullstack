import { corsOptions } from "@/app/constants/corsOptions";
import { errorHandler, notFoundHandler } from "@/middleware";
import { pinoLoggerMiddleware } from "@/middleware/pinoLoggerMiddleware";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";

const createHonoApp = () => {
	const app = new Hono();

	/**
	 *  == Middleware - App Security
	 */
	app.use("/*", cors(corsOptions));

	/**
	 *  == Middleware - Logger
	 */
	// app.use(logger((...args) => consola.log(...args)));
	app.use(requestId(), pinoLoggerMiddleware());

	/**
	 *  == Notfound Route handler
	 */
	app.notFound(notFoundHandler);

	/**
	 *  == Central error handler
	 */
	app.onError(errorHandler);

	return app;
};

export { createHonoApp };
