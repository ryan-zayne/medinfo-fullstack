import { createFeatureExtractionPipeline } from "@/services/ai/huggingFace";
import type { SelectUserType } from "@medinfo/backend-db/schema/auth";

/**
 * @description Computes the dot product between two vectors.
 */
const calculateDotProduct = (vectorsA: number[], vectorsB: number[]) => {
	let product = 0;

	for (const [index, element] of vectorsA.entries()) {
		const vectorBItem = vectorsB[index];

		if (vectorBItem === undefined) continue;

		product += element * vectorBItem;
	}

	return product;
};

/**
 * @description Computes the magnitude (Euclidean norm) of a vector.
 */
const calculateMagnitude = (vectors: number[]) => {
	let sumOfSquares = 0;

	for (const vector of vectors) {
		sumOfSquares += vector * vector;
	}

	return Math.sqrt(sumOfSquares);
};

/**
 * @description Returns the cosine similarity of two vectors.
 * Result is between -1 and 1, where 1 is identical.
 */
const calculateCosineSimilarity = (vectorsA: number[], vectorsB: number[]) => {
	const dotProduct = calculateDotProduct(vectorsA, vectorsB);

	const magA = calculateMagnitude(vectorsA);
	const magB = calculateMagnitude(vectorsB);

	if (magA === 0 || magB === 0) {
		return 0;
	}

	const cosineSimilarity = dotProduct / (magA * magB);

	return cosineSimilarity;
};

const featureExtractionPipeline = createFeatureExtractionPipeline();

/**
 * @description Creates a single embedding vector for a patient's reason/symptom.
 */
const createPatientVectors = async (reason: string) => {
	const extractor = await featureExtractionPipeline.getInstance();

	const response = await extractor([reason], { normalize: true, pooling: "mean" });

	return [...response.data] as number[];
};

/**
 * @description Creates embedding vectors for each doctor's specialty.
 * @returns a 2D array: one vector per doctor.
 */
const createDoctorVectors = async (doctors: SelectUserType[]): Promise<number[][]> => {
	const extractor = await featureExtractionPipeline.getInstance();

	const specialties = doctors.map((doctor) => doctor.specialty ?? "General Practice");

	const response = await extractor(specialties, { normalize: true, pooling: "mean" });

	return response.tolist() as number[][];
};

type DoctorWithScore = SelectUserType & { similarityScore: number };

type GetTopDoctorsOptions = {
	doctors: SelectUserType[];
	limit?: number;
	minScore?: number;
	reason: string;
};

/**
 * @description Ranks doctors according to their similarity to the patient's reason.
 */
export const getTopDoctors = async (options: GetTopDoctorsOptions): Promise<DoctorWithScore[]> => {
	const { doctors, limit = 3, minScore = 0, reason } = options;

	if (doctors.length === 0) {
		return [];
	}

	const patientVector = await createPatientVectors(reason);
	const doctorVectors = await createDoctorVectors(doctors);

	const doctorsWithScores: DoctorWithScore[] = [];

	for (const [index, doctor] of doctors.entries()) {
		const doctorVector = doctorVectors[index];

		if (doctorVector === undefined) continue;

		const similarityScore = calculateCosineSimilarity(patientVector, doctorVector);

		if (similarityScore <= minScore) continue;

		doctorsWithScores.push({ ...doctor, similarityScore });
	}

	return doctorsWithScores.toSorted((a, b) => b.similarityScore - a.similarityScore).slice(0, limit);
};
