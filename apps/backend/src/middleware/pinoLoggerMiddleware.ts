import { ENVIRONMENT } from "@/config/env";
import { pinoLogger as pinoLoggerPrimitive } from "hono-pino";
import { pino } from "pino";
import pretty from "pino-pretty";

const pinoLoggerMiddleware = () => {
	return pinoLoggerPrimitive({
		pino: pino(
			{
				level: ENVIRONMENT.LOG_LEVEL,
				timestamp: pino.stdTimeFunctions.unixTime,
			},
			pretty({
				colorize: true,
				messageFormat: "{req.method} Request to url:{req.url} completed",
				singleLine: true,
			})
		),
	});
};

export { pinoLoggerMiddleware };
