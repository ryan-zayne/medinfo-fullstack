export const FRONTEND_URL =
	// eslint-disable-next-line node/no-process-env
	process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://medical-info.vercel.app";
