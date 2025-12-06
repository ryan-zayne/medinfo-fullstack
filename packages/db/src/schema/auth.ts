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
		gender: pg.text({ enum: ["male", "female"] }).notNull(),
		googleId: pg.text(),
		id: pg.uuid().defaultRandom().primaryKey(),
		isSuspended: pg.boolean().notNull().default(false),
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
		updatedAt: pg
			.timestamp({ withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [pg.uniqueIndex("user_google_id_index").on(table.googleId)]
);

export const InsertUserSchema = createInsertSchema(users);

export const SelectUserSchema = createSelectSchema(users);

export type InsertUserType = typeof users.$inferInsert;
export type SelectUserType = typeof users.$inferSelect;

// export const refreshTokens = pg.pgTable("refresh_tokens", {
// 	createdAt: pg.timestamp({ withTimezone: true }).notNull().defaultNow(),
// 	id: pg.uuid().primaryKey().defaultRandom(),
// 	expiresAt: pg.timestamp({ withTimezone: true }).notNull();
// 	refreshToken: pg.text().notNull(),
// 	userId: pg
// 		.uuid()
// 		.references(() => users.id, { onDelete: "cascade" })
// 		.notNull(),
// });
