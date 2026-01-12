import * as pg from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./auth";

export const appointments = pg.pgTable("appointments", {
	allergies: pg.text().notNull().default("none"),
	cancelledAt: pg.timestamp({ withTimezone: true }),
	createdAt: pg.timestamp({ withTimezone: true }).notNull().defaultNow(),
	dateOfAppointment: pg.timestamp({ mode: "string", withTimezone: true }).notNull(),
	doctorId: pg.uuid().references(() => users.id, { onDelete: "cascade" }),
	existingMedicalConditions: pg.text().notNull().default("none"),
	healthInsurance: pg.text({ enum: ["yes", "no"] }).notNull(),
	id: pg.uuid().defaultRandom().primaryKey(),
	language: pg
		.text({ enum: ["english"] })
		.notNull()
		.default("english"),
	meetingId: pg.text().notNull(),
	meetingURL: pg.text().notNull(),
	patientId: pg
		.uuid()
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	reason: pg.text().notNull(),
	status: pg
		.text({ enum: ["pending", "confirmed", "cancelled", "completed"] })
		.notNull()
		.default("pending"),
	updatedAt: pg
		.timestamp({ withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const InsertAppointmentSchema = createInsertSchema(appointments);

export const SelectAppointmentSchema = createSelectSchema(appointments);

export type InsertAppointmentType = typeof appointments.$inferInsert;
export type SelectAppointmentType = typeof appointments.$inferSelect;
