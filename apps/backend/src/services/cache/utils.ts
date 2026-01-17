import { parseJSON } from "@zayne-labs/toolkit-core";
import { isObject, type Awaitable, type UnmaskType } from "@zayne-labs/toolkit-type-helpers";
import { consola } from "consola";
import { redisCacheClient } from "./cache";

type CacheKeyType = UnmaskType<`health-tip:${string}` | `user:${string}`>;

export const setCache = async (
	key: CacheKeyType,
	value: number | object | string | Buffer,
	options?: { expiry?: number }
) => {
	const { expiry } = options ?? {};

	// if (!key) {
	// 	throw new Error(`Invalid key ${key} provided`);
	// }

	if (!value) {
		throw new Error("Invalid value provided");
	}

	const resolvedValue = isObject(value) && !(value instanceof Buffer) ? JSON.stringify(value) : value;

	await redisCacheClient.set(key, resolvedValue, {
		...(expiry && { expiration: { type: "EX", value: expiry } }),
	});

	consola.info(`[CACHE SET] for key ${key}`);
};

export const getFromCache = async <TCacheResult>(
	key: CacheKeyType,
	options?: { onCacheMiss?: () => Awaitable<TCacheResult> }
): Promise<TCacheResult> => {
	const { onCacheMiss } = options ?? {};

	// if (!key) {
	// 	throw new Error(`Invalid key ${key} provided`);
	// }

	const rawCachedData = await redisCacheClient.get(key);

	if (!rawCachedData) {
		consola.info(`[CACHE MISS] for key ${key}`);

		const freshData = await onCacheMiss?.();

		if (freshData) {
			await setCache(key, freshData);

			return freshData;
		}

		return null as never;
	}

	const parsedCachedData = parseJSON(rawCachedData);

	consola.info(`[CACHE HIT] for key ${key}`);

	return parsedCachedData as TCacheResult;
};

export const removeFromCache = async (key: CacheKeyType) => {
	// if (!key) {
	// 	throw new Error("Invalid key provided");
	// }

	const isDeleted = Boolean(await redisCacheClient.del(key));

	if (isDeleted) {
		consola.info(`[CACHE REMOVED] for key ${key}`);
	} else {
		consola.info(`[CACHE FAILED TO REMOVE] for key ${key}`);
	}
};
