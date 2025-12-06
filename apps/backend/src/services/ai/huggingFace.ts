import {
	pipeline,
	type FeatureExtractionPipeline,
	type ProgressCallback,
} from "@huggingface/transformers";

export const createFeatureExtractionPipeline = () => {
	const task = "feature-extraction";
	const model = "Xenova/e5-small-v2";

	let instance: Promise<FeatureExtractionPipeline> | null = null;

	const getInstance = (progress_callback?: ProgressCallback) => {
		instance ??= pipeline(task, model, { progress_callback });

		return instance;
	};

	return { getInstance };
};
