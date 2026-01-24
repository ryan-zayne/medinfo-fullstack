import "@colors/colors";
import { serve } from "@hono/node-server";
import { consola } from "consola";
import { app } from "./app";
import { ENVIRONMENT } from "./config/env";
import { initializeRedisCacheClient } from "./services/cache";

serve(
	{
		fetch: app.fetch,
		port: ENVIRONMENT.PORT,
	},
	(info) => {
		void initializeRedisCacheClient();

		const message =
			ENVIRONMENT.NODE_ENV === "development" ? `http://localhost:${info.port}` : `PORT=${info.port}`;

		consola.info(`Server is running on ${message}`.yellow.italic);
	}
);

// Doing this to enable vercel deployment to work
// export default app as never;
