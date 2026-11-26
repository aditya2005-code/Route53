import axios from "axios";
import { getToken, removeToken } from "../utils/token";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// 1. Create the Axios instance with production timeouts
export const client = axios.create({
  baseURL: API_URL,
  timeout: 35000, // 35s timeout to handle free-tier cloud container cold starts gracefully
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 2. Request Interceptor: Auto-attach the JWT token if it exists
client.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor: Auto-handle 401 Unauthorized errors and network outages
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized: Session has expired or token is invalid
    if (error.response && error.response.status === 401) {
      removeToken();

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/auth/login") &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.href = "/auth/login?expired=true";
      }
    }

    // Network / Cold-Start Error (No response received)
    if (!error.response && error.message) {
      error.userFriendlyMessage =
        "Backend service is currently unreachable or cold-starting. Please allow 30 seconds and retry.";
    }

    return Promise.reject(error);
  }
);

export default client;
