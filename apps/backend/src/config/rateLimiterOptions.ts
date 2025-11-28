import { rateLimiter } from "hono-rate-limiter";

const rateLimiterOptions = {
	keyGenerator: (ctx) => ctx.req.header("x-forwarded-for") ?? "unknown",
	limit: 100,
	message: "Too many requests from this IP, please try again later.",
	standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	windowMs: 15 * 60 * 1000,
} satisfies Parameters<typeof rateLimiter>[0];

export { rateLimiterOptions };
