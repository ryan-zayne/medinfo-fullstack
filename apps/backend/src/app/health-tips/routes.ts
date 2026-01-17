import { backendApiSchemaRoutes } from "@medinfo/shared/validation/backendApiSchema";
import { omitKeys } from "@zayne-labs/toolkit-core";
import { Hono } from "hono";
import { AppJsonResponse } from "@/lib/utils/AppJsonResponse";
import { validateWithZodMiddleware } from "@/middleware";
import { getFromCache } from "@/services/cache";
import { getRandomHealthTipIds } from "./services/common";
import { healthApi } from "./services/healthApi";

const healthTipsRoutes = new Hono()
	.basePath("/health-tips")
	.get(
		"/all",
		validateWithZodMiddleware("query", backendApiSchemaRoutes["@get/health-tips/all"].query),
		async (ctx) => {
			const { limit = 6 } = ctx.req.valid("query") ?? {};

			const randomHealthTipIds = getRandomHealthTipIds(limit);

			const healthTips = await Promise.all(
				randomHealthTipIds.map((id) =>
					getFromCache(`health-tip:${id}`, {
						onCacheMiss: async () => {
							const tip = await healthApi.getTopicDetails({ TopicId: id });

							return omitKeys(tip.data, ["lastUpdated", "mainContent"]);
						},
					})
				)
			);

			return AppJsonResponse(ctx, {
				data: healthTips,
				message: "Health tips retrieved successfully",
				schema: backendApiSchemaRoutes["@get/health-tips/all"].data,
			});
		}
	)
	.get(
		"/one/:id",
		validateWithZodMiddleware("param", backendApiSchemaRoutes["@get/health-tips/one/:id"].params),
		async (ctx) => {
			const { id } = ctx.req.valid("param");

			const healthTip = await getFromCache(`health-tip:${id}`, {
				onCacheMiss: async () => {
					const tip = await healthApi.getTopicDetails({ TopicId: id });

					return tip.data;
				},
			});

			return AppJsonResponse(ctx, {
				data: healthTip,
				message: "Health tip retrieved successfully",
				schema: backendApiSchemaRoutes["@get/health-tips/one/:id"].data,
			});
		}
	);

export { healthTipsRoutes };
