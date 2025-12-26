import { db } from "@medinfo/backend-db";
import { diseases } from "@medinfo/backend-db/schema/diseases";
import { backendApiSchemaRoutes } from "@medinfo/shared/validation/backendApiSchema";
import { asc, count, eq, gt, sql } from "drizzle-orm";
import { Hono } from "hono";
import { AppError, AppJsonResponse } from "@/lib/utils";
import { validateWithZodMiddleware } from "@/middleware";

const diseasesRoutes = new Hono()
	.basePath("/diseases")
	.get(
		"/all",
		validateWithZodMiddleware("query", backendApiSchemaRoutes["@get/diseases/all"].query),
		async (ctx) => {
			const { limit = 6, page = 1, random = false } = ctx.req.valid("query") ?? {};

			const baseQuery = db
				.select({
					description: diseases.description,
					image: diseases.image,
					name: diseases.name,
				})
				.from(diseases);

			const offset = (page - 1) * limit;

			const [diseasesResult, [totalCount]] = await Promise.all([
				random ?
					baseQuery.orderBy(sql`RANDOM()`).limit(limit)
				:	baseQuery.orderBy(asc(diseases.id)).where(gt(diseases.id, offset)).limit(limit),
				random ? [null] : db.select({ value: count() }).from(diseases),
			]);

			return AppJsonResponse(ctx, {
				data: {
					diseases: diseasesResult,
					pagination: {
						limit,
						page: random ? 1 : page,
						total: random ? diseasesResult.length : (totalCount?.value ?? 0),
					},
				},
				message: "Diseases retrieved successfully",
				schema: backendApiSchemaRoutes["@get/diseases/all"].data,
			});
		}
	)
	.get(
		"/one/:name",
		validateWithZodMiddleware("param", backendApiSchemaRoutes["@get/diseases/one/:name"].params),
		async (ctx) => {
			const { name } = ctx.req.valid("param");

			const [disease] = await db.select().from(diseases).where(eq(diseases.name, name)).limit(1);

			if (!disease) {
				throw new AppError({
					code: 404,
					message: "Disease not found",
				});
			}

			return AppJsonResponse(ctx, {
				data: disease,
				message: "Disease retrieved successfully",
				schema: backendApiSchemaRoutes["@get/diseases/one/:name"].data,
			});
		}
	)
	.post(
		"/add",
		validateWithZodMiddleware("json", backendApiSchemaRoutes["@post/diseases/add"].body),
		async (ctx) => {
			const { description, image, name, precautions, symptoms } = ctx.req.valid("json");

			const [existingDisease] = await db
				.select({ id: diseases.id })
				.from(diseases)
				.where(eq(diseases.name, name))
				.limit(1);

			if (existingDisease) {
				throw new AppError({
					code: 409,
					message: "Disease already exists",
				});
			}

			const [newDisease] = await db
				.insert(diseases)
				.values({
					description,
					image,
					name,
					precautions,
					symptoms,
				})
				.returning();

			if (!newDisease) {
				throw new AppError({
					code: 500,
					message: "Failed to add disease",
				});
			}

			return AppJsonResponse(ctx, {
				data: newDisease,
				message: "Disease added successfully",
				schema: backendApiSchemaRoutes["@post/diseases/add"].data,
			});
		}
	)
	.patch(
		"/update",
		validateWithZodMiddleware("json", backendApiSchemaRoutes["@patch/diseases/update"].body),
		async (ctx) => {
			const { description, image, name, precautions, symptoms } = ctx.req.valid("json");

			const [updatedDisease] = await db
				.update(diseases)
				.set({
					description,
					image,
					name,
					precautions,
					symptoms,
				})
				.where(eq(diseases.name, name))
				.returning();

			if (!updatedDisease) {
				throw new AppError({
					code: 404,
					message: "Disease not found",
				});
			}

			return AppJsonResponse(ctx, {
				data: updatedDisease,
				message: "Disease updated successfully",
				schema: backendApiSchemaRoutes["@patch/diseases/update"].data,
			});
		}
	)
	.delete(
		"/delete",
		validateWithZodMiddleware("json", backendApiSchemaRoutes["@delete/diseases/delete"].body),
		async (ctx) => {
			const { name } = ctx.req.valid("json");

			const [deletedDisease] = await db.delete(diseases).where(eq(diseases.name, name)).returning();

			if (!deletedDisease) {
				throw new AppError({
					code: 404,
					message: "Disease not found",
				});
			}

			return AppJsonResponse(ctx, {
				data: null,
				message: "Disease deleted successfully",
				schema: backendApiSchemaRoutes["@delete/diseases/delete"].data,
			});
		}
	);

export { diseasesRoutes };
