import axios from "axios";
import API_ENDPOINTS from "../constants/apiEndpoints";
import { tokenStore } from "../utils/tokenStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/identity/api/v1";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true, // gửi cookie (refresh) sang backend
});

// Instance riêng để refresh, tránh interceptor loop
const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

// Gắn access token từ RAM trước khi gửi request
apiClient.interceptors.request.use((config) => {
    const token = tokenStore.get();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Đảm bảo chỉ refresh 1 lần cho nhiều request đồng thời
let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, newToken) => {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(newToken);
    });
    pendingQueue = [];
};

apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;

        // Nếu 401 và chưa retry
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;

            if (isRefreshing) {
                // Đợi refresh đang diễn ra
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
                // Gọi refresh: cookie HttpOnly sẽ tự gửi kèm
                const { data } = await refreshClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
                const newAccess = data?.accessToken;
                if (!newAccess) throw new Error("No access token in refresh response");

                tokenStore.set(newAccess);
                processQueue(null, newAccess);

                // Gửi lại request ban đầu
                original.headers.Authorization = `Bearer ${newAccess}`;
                return apiClient(original);
            } catch (refreshErr) {
                tokenStore.clear();
                processQueue(refreshErr, null);
                // (tuỳ bạn) redirect về /login ở đây hoặc để caller xử lý
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
