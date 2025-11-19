import type { cors } from "hono/cors";

export const corsOptions: Parameters<typeof cors>[0] = {
	credentials: true,
	origin: ["http://localhost:3000", "https://medical-info.vercel.app"],
};
