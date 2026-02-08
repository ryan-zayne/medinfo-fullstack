import { pinoLogger as pinoLoggerPrimitive } from "hono-pino";
import { pino } from "pino";
import pretty from "pino-pretty";
import { ENVIRONMENT } from "@/config/env";

export const pinoLogger = pino(
	{
		level: ENVIRONMENT.LOG_LEVEL,
		timestamp: pino.stdTimeFunctions.unixTime,
	},
	pretty({
		colorize: true,
		messageFormat: "'{req.method}' request to url:'{req.url}' completed in {responseTime}ms",
		singleLine: true,
	})
);

export const pinoLoggerMiddleware = () => {
	return pinoLoggerPrimitive({
		pino: pinoLogger,
	});
};
