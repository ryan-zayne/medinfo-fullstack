import {
	env,
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

			env.allowLocalModels = false;

			instance = pipeline(task, model, {
				device: "cpu",
				progress_callback,
			}).catch((error) => {
				const errorObject = new Error("[HuggingFace] Pipeline creation failed", { cause: error });

				consola.error(errorObject);
				throw errorObject;
			});
		}

		return instance;
	};

	return { getInstance };
};
