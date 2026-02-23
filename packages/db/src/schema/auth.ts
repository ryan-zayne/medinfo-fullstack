import * as pg from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pg.pgTable(
	"users",
	{
		avatar: pg.text().notNull(),
		country: pg.text(),
		createdAt: pg.timestamp({ withTimezone: true }).notNull().defaultNow(),
		deletedAt: pg.timestamp({ withTimezone: true }),
		dob: pg.timestamp({ mode: "string", withTimezone: true }).notNull(),
		email: pg.text().notNull().unique(),
		emailVerifiedAt: pg.timestamp({ withTimezone: true }),
		firstName: pg.text().notNull(),
		fullName: pg.text().notNull(),
		gender: pg.text({ enum: ["male", "female"] }).notNull(),
		googleId: pg.text(),
		id: pg.uuid().defaultRandom().primaryKey(),
		lastLoginAt: pg.timestamp({ withTimezone: true }).notNull().defaultNow(),
		lastName: pg.text().notNull(),
		loginRetryCount: pg.integer().notNull().default(0),
		medicalLicense: pg.text(),
		passwordHash: pg.text(),
		refreshTokenArray: pg
			.jsonb()
			.notNull()
			.$type<Array<{ expiresAt: Date; token: string }>>()
			.default([]),
		role: pg.text({ enum: ["doctor", "patient"] }).notNull(),
		specialty: pg.text(),
		suspendedAt: pg.timestamp({ withTimezone: true }),
		updatedAt: pg
			.timestamp({ withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		pg.uniqueIndex("user_email_index").on(table.email),
		pg.uniqueIndex("user_google_id_index").on(table.googleId),
	]
);

export const InsertUserSchema = createInsertSchema(users);

export const SelectUserSchema = createSelectSchema(users);

export type InsertUserType = typeof users.$inferInsert;
export type SelectUserType = typeof users.$inferSelect;

// export const refreshTokens = pg.pgTable(
// 	"refresh_tokens",
// 	{
// 		createdAt: pg.timestamp({ withTimezone: true }).notNull().defaultNow(),
// 		expiresAt: pg.timestamp({ withTimezone: true }).notNull(),
// 		id: pg.uuid().primaryKey().defaultRandom(),
// 		token: pg.text().notNull().unique(),
// 		userId: pg
// 			.uuid()
// 			.notNull()
// 			.references(() => users.id, { onDelete: "cascade" }),
// 	},
// 	(table) => [
// 		pg.uniqueIndex("rt_token_index").on(table.token),
// 		pg.index("rt_user_id_index").on(table.userId),
// 	]
// );

export const emailVerificationCodes = pg.pgTable("email_verification_tokens", {
	code: pg.text().notNull().unique(),
	createdAt: pg.timestamp({ withTimezone: true }).defaultNow().notNull(),
	email: pg.text().unique().notNull(),
	expiresAt: pg.timestamp({ withTimezone: true }).notNull(),
	id: pg.uuid().defaultRandom().primaryKey(),
	userId: pg
		.uuid()
		.unique()
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
});
