import {
	pipeline,
	type FeatureExtractionPipeline,
	type ProgressCallback,
} from "@huggingface/transformers";
import { consola } from "consola";

export const createFeatureExtractionPipeline = () => {
	const task = "feature-extraction";
	const model = "Xenova/e5-small-v2";

	let instance: Promise<FeatureExtractionPipeline> | null = null;

	const getInstance = (progress_callback?: ProgressCallback) => {
		if (instance === null) {
			consola.info(`[HuggingFace] Initializing pipeline...`);

			instance = pipeline(task, model, { device: "cpu", dtype: "q4", progress_callback }).catch(
				(error) => {
					consola.error(
						"[HuggingFace] Pipeline creation failed:",
						(error as Error | undefined)?.message
					);
					throw error;
				}
			);
		}

		return instance;
	};

	return { getInstance };
};
