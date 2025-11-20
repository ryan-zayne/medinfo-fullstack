import type { ContentfulStatusCode } from "hono/utils/http-status";

class AppError extends Error {
	errors?: unknown;
	errorStatus: string;
	statusCode: ContentfulStatusCode;

	constructor(options: ErrorOptions & { code: ContentfulStatusCode; errors?: unknown; message: string }) {
		const { cause, code: statusCode, errors, message } = options;

		super(message, { cause });

		this.statusCode = statusCode;
		this.errorStatus = String(statusCode).startsWith("5") ? "Failed" : "Error";
		this.errors = errors;
	}

	static override isError(error: unknown): error is AppError {
		return error instanceof AppError;
	}
}

export { AppError };
