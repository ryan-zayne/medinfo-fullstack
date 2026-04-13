import { consola } from "consola";
import { createHonoApp } from "@/lib/hono";
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

try {
	const { createBullBoardSetup } = await import("@/services/queues/utils/bullBoard");
	const bullBoardSetup = createBullBoardSetup();
	app.route(bullBoardSetup.baseQueuesPath, bullBoardSetup.queuesServerAdapter.registerPlugin());
} catch (error) {
	consola.error(new Error(`Failed to load bullboard`, { cause: error }));
}

export { app };
