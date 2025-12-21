import { createHonoApp } from "../lib/factory";
import { appointmentsRoutes } from "./appointments/routes";
import { authRoutes } from "./auth/routes";
import { diseasesRoutes } from "./diseases/routes";
import { healthTipsRoutes } from "./health-tips/routes";

const app = createHonoApp();

/**
 *  == Health Check Route
 */
app.get("/", (c) => {
	return c.json({
		status: "success",
		// eslint-disable-next-line perfectionist/sort-objects
		message: "Server is up and running!",
	});
});

/**
 *  == Routes - v1
 */
app.basePath("/api/v1")
	.route("", healthTipsRoutes)
	.route("", diseasesRoutes)
	.route("", authRoutes)
	.route("", appointmentsRoutes);

export { app };
