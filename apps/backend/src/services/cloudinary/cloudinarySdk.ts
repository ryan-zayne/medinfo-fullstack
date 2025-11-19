import { ENVIRONMENT } from "@/config/env";
import { createPromiseWithResolvers } from "@zayne-labs/toolkit-core";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

cloudinary.config({
	api_key: ENVIRONMENT.CLOUDINARY_API_KEY,
	api_secret: ENVIRONMENT.CLOUDINARY_API_SECRET,
	cloud_name: ENVIRONMENT.CLOUDINARY_CLOUD_NAME,
	secure: true,
});

export const uploadStreamToCloudinary = async (file: File | undefined) => {
	if (!file) {
		return null;
	}

	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	const { promise, reject, resolve } = createPromiseWithResolvers<UploadApiResponse>();

	const uploadStream = cloudinary.uploader.upload_stream(
		{
			folder: "medicalCerts",
			resource_type: "raw",
			unique_filename: true,
			use_filename: true,
		},
		(error, result) => {
			if (error) {
				reject(error);
				return;
			}

			if (!result) {
				reject(new Error("Upload Result is undefined"));
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
