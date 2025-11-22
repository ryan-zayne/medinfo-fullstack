import "@colors/colors";
import { serve } from "@hono/node-server";
import { consola } from "consola";
import { app } from "./app";
import { ENVIRONMENT } from "./config/env";

serve(
	{
		fetch: app.fetch,
		port: ENVIRONMENT.PORT,
	},
	(info) => {
		consola.info(`Server is running on http://localhost:${info.port}`.yellow.italic);
	}
);

// eslint-disable-next-line unicorn/prefer-export-from
export default app;
