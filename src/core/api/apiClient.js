import axios from "axios";
import { tokenStore } from "../utils/tokenStore";
// SỬA LẠI DÒNG NÀY: Import hàm refreshToken từ file của nó
import { refreshToken } from "./refreshToken";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000/identity/api/v1";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

// Interceptor request
apiClient.interceptors.request.use((config) => {
    const token = tokenStore.get();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// SỬA LẠI INTERCEPTOR RESPONSE
apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const newAccessToken = await refreshToken();
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
