import { corsOptions } from "@/config/corsOptions";
import { rateLimiterOptions } from "@/config/rateLimiterOptions";
import { secureHeadersOptions } from "@/config/secureHeadersOptions";
import { errorHandler, notFoundHandler } from "@/middleware";
import { pinoLoggerMiddleware } from "@/middleware/pinoLogger";
import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";

const createHonoApp = () => {
	const app = new Hono();

	/**
	 *  == Middleware - App Security
	 */
	app.use(rateLimiter(rateLimiterOptions));
	app.use(secureHeaders(secureHeadersOptions));
	app.use(cors(corsOptions));

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
