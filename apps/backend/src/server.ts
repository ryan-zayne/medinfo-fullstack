import "@colors/colors";
import { serve } from "@hono/node-server";
import { consola } from "consola";
import { Hono } from "hono";
import { app as appMain } from "./app/app";
import { ENVIRONMENT } from "./config/env";

// Doing this to enable vercel deployment to work
const app = new Hono().route("/", appMain);

serve(
	{
		fetch: app.fetch,
		port: ENVIRONMENT.PORT,
	},
	(info) => {
		consola.info(`Server is running on http://localhost:${info.port}`.yellow.italic);
	}
);

// Doing this to enable vercel deployment to work
export default app;
