import { AppJsonResponse } from "@/lib/utils";
import { validateWithZodMiddleware } from "@/middleware";
import { db } from "@medinfo/backend-db";
import { users } from "@medinfo/backend-db/schema/auth";
import {
	backendApiSchemaRoutes,
	type DoctorUserSchemaType,
} from "@medinfo/shared/validation/backendApiSchema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { authMiddleware } from "../auth/middleware/authMiddleware";
import { getTopDoctors } from "./services/matchDoctorAlgorithm";

const appointmentsRoutes = new Hono()
	.basePath("/appointments")
	.use(authMiddleware)
	.post(
		"/match-doctor",
		validateWithZodMiddleware("json", backendApiSchemaRoutes["@post/appointments/match-doctor"].body),
		async (ctx) => {
			const { reason } = ctx.req.valid("json");

			const allDoctors = await db
				.select({
					avatar: users.avatar,
					country: users.country,
					email: users.email,
					firstName: users.firstName,
					gender: users.gender,
					id: users.id,
					lastName: users.lastName,
					role: users.role,
					specialty: users.specialty,
				})
				.from(users)
				.where(eq(users.role, "doctor"));

			const topDoctors = await getTopDoctors({ doctors: allDoctors as DoctorUserSchemaType[], reason });

			return AppJsonResponse(ctx, {
				data: { doctors: topDoctors },
				message: "Top doctors retrieved successfully",
				schema: backendApiSchemaRoutes["@post/appointments/match-doctor"].data,
			});
		}
	)
	.post(
		"/book",
		validateWithZodMiddleware("json", backendApiSchemaRoutes["@post/appointments/book"].body),
		async (ctx) => {
			const {
				reason,
				doctorId,
				existingMedicalConditions,
				allergies,
				dateOfAppointment,
				healthInsurance,
				language,
			} = ctx.req.valid("json");
		}
	);

export { appointmentsRoutes };
