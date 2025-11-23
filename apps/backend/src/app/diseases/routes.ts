import { AppError, AppJsonResponse } from "@/lib/utils";
import { validateWithZodMiddleware } from "@/middleware";
import {
	backendApiSchemaRoutes,
	type DiseaseSchemaType,
} from "@medinfo/shared/validation/backendApiSchema";
import { pickKeys } from "@zayne-labs/toolkit-core";
import { Hono } from "hono";
import { readDiseases, shuffleArray, writeToDiseases } from "./services/common";

const diseasesRoutes = new Hono()
	.basePath("/diseases")
	.get(
		"/all",
		validateWithZodMiddleware("query", backendApiSchemaRoutes["@get/diseases/all"].query),
		async (ctx) => {
			const { limit = 6, page = 1, random = false } = ctx.req.valid("query") ?? {};

			const diseasesResult = await readDiseases();

			const shuffledDiseases = random ? shuffleArray(diseasesResult) : diseasesResult;

			const startIndex = (page - 1) * limit;
			const endIndex = startIndex + limit;

			const paginatedDiseases = shuffledDiseases.slice(startIndex, endIndex);

			const diseases = paginatedDiseases.map((disease) =>
				pickKeys(disease, ["name", "image", "description"])
			);

			return AppJsonResponse(ctx, {
				data: {
					diseases,
					limit,
					page,
					total: diseasesResult.length,
				},
				message: "Diseases retrieved successfully",
				schema: backendApiSchemaRoutes["@get/diseases/all"],
			});
		}
	)
	.get(
		"/one/:name",
		validateWithZodMiddleware("param", backendApiSchemaRoutes["@get/diseases/one/:name"].params),
		async (ctx) => {
			const { name: diseaseName } = ctx.req.valid("param");

			const diseaseResult = await readDiseases();

			const data = diseaseResult.find(
				(disease) => disease.name.toLowerCase() === diseaseName.toLowerCase()
			);

			if (!data) {
				throw new AppError({
					code: 404,
					message: "Disease not found",
				});
			}

			return AppJsonResponse(ctx, {
				data,
				message: "Disease retrieved successfully",
				schema: backendApiSchemaRoutes["@get/diseases/one/:name"],
			});
		}
	)
	.post(
		"/add",
		validateWithZodMiddleware("json", backendApiSchemaRoutes["@post/diseases/add"].body),
		async (ctx) => {
			const { details } = ctx.req.valid("json");

			const diseaseResult = await readDiseases();

			const isExistingDisease = diseaseResult.some(
				(item) => item.name.toLowerCase() === details.name.toLowerCase()
			);

			if (isExistingDisease) {
				throw new AppError({
					code: 409,
					message: "Disease already exists",
				});
			}

			diseaseResult.push(details);

			await writeToDiseases(diseaseResult);

			return AppJsonResponse(ctx, {
				data: details,
				message: "Diseases add successfully",
				schema: backendApiSchemaRoutes["@post/diseases/add"],
			});
		}
	)
	.patch(
		"/update",
		validateWithZodMiddleware("json", backendApiSchemaRoutes["@patch/diseases/update"].body),
		async (ctx) => {
			const { details: diseaseDetails, name: diseaseName } = ctx.req.valid("json");

			const diseasesResult = await readDiseases();

			const disease = diseasesResult.find(
				(item) => item.name.toLowerCase() === diseaseName.toLowerCase()
			);

			if (!disease) {
				throw new AppError({
					code: 404,
					message: "Disease not found",
				});
			}

			const updatedDisease = { ...disease, ...diseaseDetails } as DiseaseSchemaType;

			diseasesResult.splice(diseasesResult.indexOf(disease), 1, updatedDisease);

			await writeToDiseases(diseasesResult);

			return AppJsonResponse(ctx, {
				data: updatedDisease,
				message: "Disease updated successfully",
				schema: backendApiSchemaRoutes["@patch/diseases/update"],
			});
		}
	)
	.delete(
		"/delete",
		validateWithZodMiddleware("json", backendApiSchemaRoutes["@delete/diseases/delete"].body),
		async (ctx) => {
			const { name: diseaseName } = ctx.req.valid("json");

			const result = await readDiseases();

			const disease = result.find((item) => item.name.toLowerCase() === diseaseName.toLowerCase());

			if (!disease) {
				throw new AppError({
					code: 404,
					message: "Disease not found",
				});
			}

			const diseaseIndex = result.indexOf(disease);

			result.splice(diseaseIndex, 1);

			await writeToDiseases(result);

			return AppJsonResponse(ctx, {
				data: null,
				message: "Disease deleted successfully",
				schema: backendApiSchemaRoutes["@delete/diseases/delete"],
			});
		}
	);

export { diseasesRoutes };
