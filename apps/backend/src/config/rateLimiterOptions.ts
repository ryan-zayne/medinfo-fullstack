import type { ConfigProps } from "hono-rate-limiter";

const rateLimiterOptions = {
	keyGenerator: (ctx) => ctx.req.header("x-forwarded-for") ?? "unknown",
	limit: 100,
	message: "Too many requests from this IP, please try again later.",
	standardHeaders: "draft-7",
	windowMs: 15 * 60 * 1000,
} satisfies ConfigProps;

const authRateLimiterOptions = {
	keyGenerator: (ctx) => ctx.req.header("x-forwarded-for") ?? "unknown",
	limit: 5,
	message: "Too many auth attempts from this IP, please try again later.",
	standardHeaders: "draft-7",
	windowMs: 30 * 60 * 1000,
} satisfies ConfigProps;

export { authRateLimiterOptions, rateLimiterOptions };
