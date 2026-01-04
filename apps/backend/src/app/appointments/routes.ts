import { db } from "@medinfo/db";
import { appointments } from "@medinfo/db/schema/appointments";
import { users } from "@medinfo/db/schema/auth";
import {
	backendApiSchemaRoutes,
	type DoctorUserSchemaType,
} from "@medinfo/shared/validation/backendApiSchema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { AppError, AppJsonResponse } from "@/lib/utils";
import { validateWithZodMiddleware } from "@/middleware";
import { authMiddleware } from "../auth/middleware/authMiddleware";
import { getTopDoctors } from "./services/matchDoctorAlgo";
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
					fullName: users.fullName,
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

			const currentUser = ctx.get("currentUser");

			if (currentUser.role !== "patient") {
				throw new AppError({
					code: 401,
					message: "Only patients can book appointments",
				});
			}

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
				patientEmail: currentUser.email,
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
					meetingId: zoomMeetingDetails.id as unknown as string,
					meetingURL: zoomMeetingDetails.join_url,
					patientId: currentUser.id,
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
					doctorName: doctor.fullName,
					id: newAppointment.id,
					meetingId: newAppointment.meetingId,
					meetingURL: newAppointment.meetingURL,
					patientName: currentUser.fullName,
					reason: newAppointment.reason,
					status: newAppointment.status,
				},
				message: "Appointment booked successfully",
				schema: backendApiSchemaRoutes["@post/appointments/book"].data,
			});
		}
	)
	.get(
		"/doctor/all",
		validateWithZodMiddleware("query", backendApiSchemaRoutes["@get/appointments/doctor/all"].query),
		async (ctx) => {
			const { limit = 10 } = ctx.req.valid("query") ?? {};

			const currentUser = ctx.get("currentUser");

			if (currentUser.role !== "doctor") {
				throw new AppError({
					code: 401,
					message: "Only doctors can access this route",
				});
			}

			const appointmentsResult = await db
				.select({
					dateOfAppointment: appointments.dateOfAppointment,
					id: appointments.id,
					meetingId: appointments.meetingId,
					meetingURL: appointments.meetingURL,
					patientName: users.fullName,
					reason: appointments.reason,
					status: appointments.status,
				})
				.from(appointments)
				.innerJoin(users, eq(appointments.patientId, users.id))
				.where(eq(appointments.doctorId, currentUser.id))
				.limit(limit);

			return AppJsonResponse(ctx, {
				data: {
					appointments: appointmentsResult,
					pagination: {
						limit,
						total: appointmentsResult.length,
					},
				},
				message: "Appointments retrieved successfully",
				schema: backendApiSchemaRoutes["@get/appointments/doctor/all"].data,
			});
		}
	)
	.get(
		"/patient/all",
		validateWithZodMiddleware("query", backendApiSchemaRoutes["@get/appointments/patient/all"].query),
		async (ctx) => {
			const { limit = 10 } = ctx.req.valid("query") ?? {};

			const currentUser = ctx.get("currentUser");

			if (currentUser.role !== "patient") {
				throw new AppError({
					code: 401,
					message: "Only patients can access this route",
				});
			}

			const appointmentsResult = await db
				.select({
					dateOfAppointment: appointments.dateOfAppointment,
					doctorName: users.fullName,
					id: appointments.id,
					meetingId: appointments.meetingId,
					meetingURL: appointments.meetingURL,
					reason: appointments.reason,
					status: appointments.status,
				})
				.from(appointments)
				.innerJoin(users, eq(appointments.doctorId, users.id))
				.where(eq(appointments.patientId, currentUser.id))
				.limit(limit);

			return AppJsonResponse(ctx, {
				data: {
					appointments: appointmentsResult,
					pagination: {
						limit,
						total: appointmentsResult.length,
					},
				},
				message: "Appointments retrieved successfully",
				schema: backendApiSchemaRoutes["@get/appointments/patient/all"].data,
			});
		}
	)
	.delete(
		"/cancel",
		validateWithZodMiddleware("json", backendApiSchemaRoutes["@delete/appointments/cancel"].body),
		async (ctx) => {
			const { appointmentId, meetingId } = ctx.req.valid("json");

			const currentUser = ctx.get("currentUser");

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

			if (
				(currentUser.role === "patient" && appointment.patientId !== currentUser.id)
				|| (currentUser.role === "doctor" && appointment.doctorId !== currentUser.id)
			) {
				throw new AppError({
					code: 403,
					message: "Forbidden",
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
