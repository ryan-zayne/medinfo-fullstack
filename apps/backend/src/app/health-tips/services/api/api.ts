import { AppError } from "@/lib/utils";
import type { HealthTipSchemaType } from "@medinfo/shared/validation/backendApiSchema";
import { createFetchClient } from "@zayne-labs/callapi";
import { z } from "zod";
import { healthApiSchema, type healthApiSchemaRoutes } from "./apiSchema";

const BASE_URL = "https://odphp.health.gov/myhealthfinder/api/v4";

const callHealthApi = createFetchClient({
	baseURL: BASE_URL,
	dedupeStrategy: "defer",
	schema: healthApiSchema,
});

export const getTopicDetails = async (
	query: z.infer<(typeof healthApiSchemaRoutes)["@get/topicsearch.json"]["query"]>
) => {
	const { data: responseData, error } = await callHealthApi("@get/topicsearch.json", { query });

	if (error) {
		throw new AppError({
			cause: error.originalError,
			code: 500,
			message: error.message,
		});
	}

	const resource = responseData.Result.Resources.Resource[0];

	if (!resource) {
		throw new AppError({
			code: 404,
			message: "Resource not found",
		});
	}

	const lastUpdatedDate = new Date(Number(resource.LastUpdate)).toLocaleDateString();
	const lastUpdatedTime = new Date(Number(resource.LastUpdate)).toLocaleTimeString();

	const data = {
		id: resource.Id,
		imageAlt: resource.ImageAlt,
		imageUrl: resource.ImageUrl,
		lastUpdated: `${lastUpdatedDate} ${lastUpdatedTime}`,
		mainContent: resource.Sections.section.map((item) => ({
			content: item.Content,
			title: item.Title ?? "",
		})),
		title: resource.Title,
	} satisfies HealthTipSchemaType;

	return {
		data,
		message: "Topic details retrieved successfully",
	};
};
