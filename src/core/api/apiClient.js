import axios from "axios";
import { tokenStore } from "../utils/tokenStore";
import refreshClient from "./refreshToken"; // import client riêng để refresh token
import API_ENDPOINTS from "../constants/apiEndpoints";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000/identity/api/v1";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, newToken) => {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(newToken);
    });
    pendingQueue = [];
};

// Interceptor request
apiClient.interceptors.request.use((config) => {
    const token = tokenStore.get();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Interceptor response
apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;

        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push({
                        resolve: (token) => {
                            original.headers.Authorization = `Bearer ${token}`;
                            resolve(apiClient(original));
                        },
                        reject,
                    });
                });
            }

            isRefreshing = true;
            try {
                const { data } = await refreshClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
                const newAccess = data?.result.access_token;
                if (!newAccess) throw new Error("No access token in refresh response");

                tokenStore.set(newAccess);
                processQueue(null, newAccess);

                original.headers.Authorization = `Bearer ${newAccess}`;
                return apiClient(original);
            } catch (refreshErr) {
                tokenStore.clear();
                processQueue(refreshErr, null);
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
