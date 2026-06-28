import axios from "axios";
import { getToken, removeToken } from "../utils/token";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// 1. Create the Axios instance
export const client = axios.create({
  baseURL: API_URL,
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

// 3. Response Interceptor: Auto-handle 401 Unauthorized errors globally
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns 401 Unauthorized, log out client-side
    if (error.response && error.response.status === 401) {
      removeToken();
      
      // Prevent infinite redirect loops if we are already on the login page
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = `/login?expired=true`;
      }
    }
    return Promise.reject(error);
  }
);

export default client;
