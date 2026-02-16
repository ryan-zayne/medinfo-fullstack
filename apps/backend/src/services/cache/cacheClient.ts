import { consola } from "consola";
import { createClient } from "redis";
import { ENVIRONMENT } from "@/config/env";

export const redisCacheClient = createClient({
	url:
		ENVIRONMENT.NODE_ENV === "development" ?
			ENVIRONMENT.REDIS_CACHE_URL_DEV
		:	ENVIRONMENT.REDIS_CACHE_URL,
});

redisCacheClient.on("error", (error) => {
	consola.error("Redis Client Error", error);
});

export const initializeRedisCacheClient = async () => {
	if (redisCacheClient.isOpen) return;

	try {
		await redisCacheClient.connect();

		consola.info("Connected to Redis Cache Client!");
	} catch (error) {
		consola.error("Failed to connect to Redis Cache Client", error);
	}
};
