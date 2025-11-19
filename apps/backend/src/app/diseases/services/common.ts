import { AppError } from "@/lib/utils";
import { DiseaseSchema } from "@medinfo/shared/validation/backendApiSchema";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const pathToDiseases = path.join(import.meta.dirname, "..", "db", "diseases.json");

const DiseaseArraySchema = z.array(DiseaseSchema);

export type Disease = z.infer<typeof DiseaseArraySchema>[number];

export const readDiseases = async () => {
	try {
		const result = await fs.readFile(pathToDiseases, "utf8");

		const parsedResult = JSON.parse(result);

		return DiseaseArraySchema.parse(parsedResult);
	} catch (error) {
		throw new AppError({ cause: error, code: 500, message: "Error reading from db" });
	}
};

// export const readDiseases = async () => {
// 	try {
// 		const result = await import("../db/diseases.json");

// 		return result.default satisfies Disease[];
// 	} catch (error) {
// 		throw new AppError({ cause: error, code: 500, message: "Error reading from db" });
// 	}
// };

export const writeToDiseases = async (diseases: Disease[]) => {
	try {
		await fs.writeFile(pathToDiseases, JSON.stringify(diseases, null, 2));
	} catch (error) {
		throw new AppError({ cause: error, code: 500, message: "Error writing to db" });
	}
};

export const shuffleArray = <TArray extends unknown[]>(array: TArray) => {
	const shuffledArray = [...array] as TArray;

	// == Using Fisher-Yates algorithm
	for (let lastIndex = shuffledArray.length - 1; lastIndex > 0; lastIndex--) {
		const randomIndex = Math.floor(Math.random() * (lastIndex + 1));

		[shuffledArray[lastIndex], shuffledArray[randomIndex]] = [
			shuffledArray[randomIndex],
			shuffledArray[lastIndex],
		];
	}

	return shuffledArray;
};
