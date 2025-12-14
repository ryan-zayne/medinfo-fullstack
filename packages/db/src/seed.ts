/* eslint-disable unicorn/no-process-exit */
/* eslint-disable node/no-process-exit */
import { db } from "./db";
import { diseases } from "./schema";

const readDiseases = async () => {
	try {
		const result = await import("./data/diseases.json");

		return result.default;
	} catch (error) {
		throw new Error("Error reading from diseases.json", { cause: error });
	}
};

const main = async () => {
	console.info("🌱 Seeding started...");

	try {
		const diseasesData = await readDiseases();

		console.info(`Found ${diseasesData.length} diseases to seed.`);

		await db.insert(diseases).values(diseasesData);

		console.info("✅ Seeding completed!");
		process.exit(0);
	} catch (error) {
		console.error("❌ Seeding failed:", error);
		process.exit(1);
	}
};

await main();
