import { consola } from "consola";
import { db } from "../db";
import { diseases } from "../schema";

const readDiseases = async () => {
	try {
		const result = await import("../data/diseases.json");

		return result.default;
	} catch (error) {
		throw new Error("Error reading from diseases.json", { cause: error });
	}
};

export const seedDiseases = async () => {
	const diseasesData = await readDiseases();

	consola.info(`Found ${diseasesData.length} diseases to seed.`);

	await db.insert(diseases).values(diseasesData);
};
