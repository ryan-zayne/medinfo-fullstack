import { appointmentsRoutes } from "./app/appointments/routes";
import { authRoutes } from "./app/auth/routes";
import { diseasesRoutes } from "./app/diseases/routes";
import { healthTipsRoutes } from "./app/health-tips/routes";
import { createHonoApp } from "./lib/factory";

const app = createHonoApp();

/**
 *  == Health Check Route
 */
app.get("/", (c) => {
	const message = "Server is up and running!";

	// eslint-disable-next-line perfectionist/sort-objects
	return c.json({ status: "success", message });
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
