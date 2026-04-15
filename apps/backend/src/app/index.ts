import { consola } from "consola";
import { ENVIRONMENT } from "@/config/env";
import { createHonoApp } from "@/lib/hono";
import { createBullBoardSetup } from "@/services/queues/utils/bullBoard";
import { appointmentsRoutes } from "./appointments/routes";
import { authRoutes } from "./auth/routes";
import { diseasesRoutes } from "./diseases/routes";
import { healthTipsRoutes } from "./health-tips/routes";

const app = createHonoApp();

/**
 *  == Health Check Route
 */
app.get("/", (c) => {
	/* eslint-disable perfectionist/sort-objects */
	return c.json({
		status: "success",
		message: "Server is up and running!",
	});
	/* eslint-enable perfectionist/sort-objects */
});

/**
 *  == Routes - v1
 */
app.basePath("/api/v1")
	.route("", healthTipsRoutes)
	.route("", diseasesRoutes)
	.route("", authRoutes)
	.route("", appointmentsRoutes);

if (ENVIRONMENT.NODE_ENV === "development") {
	try {
		const bullBoardSetup = await createBullBoardSetup();

		app.route(bullBoardSetup.baseQueuesPath, bullBoardSetup.queuesServerAdapter.registerPlugin());
	} catch (error) {
		consola.error(new Error(`Failed to load bullboard`, { cause: error }));
	}
}
export { app };
