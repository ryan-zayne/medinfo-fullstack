import { createPromiseWithResolvers } from "@zayne-labs/toolkit-core";
import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from "cloudinary";
import { ENVIRONMENT } from "@/config/env";

cloudinary.config({
	api_key: ENVIRONMENT.CLOUDINARY_API_KEY,
	api_secret: ENVIRONMENT.CLOUDINARY_API_SECRET,
	cloud_name: ENVIRONMENT.CLOUDINARY_CLOUD_NAME,
	secure: true,
});

export const uploadStreamToCloudinary = async (
	file: File | undefined,
	uploadOptions?: UploadApiOptions
) => {
	if (!file) {
		return null;
	}

	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	const { promise, reject, resolve } = createPromiseWithResolvers<UploadApiResponse>();

	const uploadStream = cloudinary.uploader.upload_stream(
		{
			...uploadOptions,
			unique_filename: true,
			use_filename: true,
		},
		(error, result) => {
			if (error || !result) {
				reject(error);
				return;
			}

			resolve(result);
		}
	);

	uploadStream.end(buffer);

	return promise;
};

// eslint-disable-next-line unicorn/prefer-export-from
export { cloudinary };
