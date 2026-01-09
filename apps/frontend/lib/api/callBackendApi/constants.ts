const REMOTE_BACKEND_HOST = "https://api-medical-info.onrender.com";

const LOCAL_BACKEND_HOST = "http://localhost:8000";

const BACKEND_HOST = process.env.NODE_ENV === "development" ? LOCAL_BACKEND_HOST : REMOTE_BACKEND_HOST;

export const BASE_API_URL = `${BACKEND_HOST}/api/v1`;
