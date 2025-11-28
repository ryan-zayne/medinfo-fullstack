import type { cors } from "hono/cors";

const corsOptions = {
	credentials: true,
	origin: ["http://localhost:3000", "https://medical-info.vercel.app"],
} satisfies Parameters<typeof cors>[0];

export { corsOptions };
