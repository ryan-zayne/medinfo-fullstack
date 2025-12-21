import * as pg from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const diseases = pg.pgTable(
	"diseases",
	{
		createdAt: pg.timestamp({ withTimezone: true }).notNull().defaultNow(),
		description: pg.text().notNull(),
		id: pg.integer().primaryKey().generatedAlwaysAsIdentity(),
		image: pg.text().notNull(),
		name: pg.text().notNull().unique(),
		precautions: pg.jsonb().$type<string[]>().notNull(),
		symptoms: pg.jsonb().$type<string[]>().notNull(),
		updatedAt: pg
			.timestamp({ withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [pg.index("diseases_name_index").on(table.name)]
);

export const InsertDiseaseSchema = createInsertSchema(diseases);
export const SelectDiseaseSchema = createSelectSchema(diseases);

export type InsertDiseaseType = typeof diseases.$inferInsert;
export type SelectDiseaseType = typeof diseases.$inferSelect;
