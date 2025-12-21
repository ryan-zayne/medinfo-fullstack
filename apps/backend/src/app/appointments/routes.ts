import { AppError, AppJsonResponse } from "@/lib/utils";
import { validateWithZodMiddleware } from "@/middleware";
import { db } from "@medinfo/backend-db";
import { appointments } from "@medinfo/backend-db/schema/appointments";
import { users } from "@medinfo/backend-db/schema/auth";
import {
	backendApiSchemaRoutes,
	type DoctorUserSchemaType,
} from "@medinfo/shared/validation/backendApiSchema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { authMiddleware } from "../auth/middleware/authMiddleware";
import { getTopDoctors } from "./services/matchDoctorAlgorithm";
import { createMeeting, deleteMeeting } from "./services/zoomApi/api";

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
				allergies,
				dateOfAppointment,
				doctorId,
				existingMedicalConditions,
				healthInsurance,
				language,
				reason,
			} = ctx.req.valid("json");

			const patient = ctx.get("currentUser");

			const [doctor] = await db.select().from(users).where(eq(users.id, doctorId)).limit(1);

			if (!doctor) {
				throw new AppError({
					code: 404,
					message: "Selected doctor not found",
				});
			}

			const zoomMeetingDetails = await createMeeting({
				dateOfAppointment,
				doctorEmail: doctor.email,
				patientEmail: patient.email,
				reason,
			});

			const [newAppointment] = await db
				.insert(appointments)
				.values({
					allergies,
					dateOfAppointment,
					doctorId,
					existingMedicalConditions,
					healthInsurance,
					language,
					meetingId: zoomMeetingDetails.id,
					meetingURL: zoomMeetingDetails.join_url,
					patientId: patient.id,
					reason,
				})
				.returning();

			if (!newAppointment) {
				throw new AppError({
					code: 500,
					message: "Failed to book appointment",
				});
			}

			return AppJsonResponse(ctx, {
				data: {
					dateOfAppointment: newAppointment.dateOfAppointment,
					doctorName: `${doctor.firstName} ${doctor.lastName}`,
					id: newAppointment.id,
					meetingId: newAppointment.meetingId,
					meetingURL: newAppointment.meetingURL,
					patientName: `${patient.firstName} ${patient.lastName}`,
					reason: newAppointment.reason,
					status: newAppointment.status,
				},
				message: "Appointment booked successfully",
				schema: backendApiSchemaRoutes["@post/appointments/book"].data,
			});
		}
	)
	.delete(
		"/cancel",
		validateWithZodMiddleware("json", backendApiSchemaRoutes["@delete/appointments/cancel"].body),
		async (ctx) => {
			const { appointmentId, meetingId } = ctx.req.valid("json");

			const patient = ctx.get("currentUser");

			const [appointment] = await db
				.select()
				.from(appointments)
				.where(eq(appointments.id, appointmentId))
				.limit(1);

			if (!appointment) {
				throw new AppError({
					code: 404,
					message: "Appointment not found",
				});
			}

			if (appointment.patientId !== patient.id) {
				throw new AppError({
					code: 403,
					message: "Forbidden Action",
				});
			}

			await Promise.all([
				db.delete(appointments).where(eq(appointments.id, appointmentId)),
				deleteMeeting(meetingId),
			]);

			return AppJsonResponse(ctx, {
				data: null,
				message: "Appointment cancelled successfully",
				schema: backendApiSchemaRoutes["@delete/appointments/cancel"].data,
			});
		}
	);

export { appointmentsRoutes };
