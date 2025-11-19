import { corsOptions } from "@/app/constants/corsOptions";
import { errorHandler, notFoundHandler } from "@/middlewares";
import { pinoLogger } from "@/middlewares/pinoLogger";
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
	app.use(requestId(), pinoLogger());

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
