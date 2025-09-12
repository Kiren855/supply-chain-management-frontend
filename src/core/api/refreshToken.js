import axios from "axios";
import API_ENDPOINTS from "../constants/apiEndpoints";
import { tokenStore } from "../utils/tokenStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000/identity/api/v1";

const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});


let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(promise => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });
    failedQueue = [];
};

/**
 * Hàm tập trung để làm mới access token.
 * Xử lý các request đồng thời để tránh gọi refresh nhiều lần.
 * @returns {Promise<string>} Access token mới.
 * @throws {Error} Nếu refresh token thất bại.
 */
export const refreshToken = async () => {
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        });
    }

    isRefreshing = true;

    try {
        console.log("Attempting to refresh token...");
        const { data } = await refreshClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
        const newAccessToken = data?.result?.access_token;

        if (!newAccessToken) {
            throw new Error("No new access token in refresh response");
        }

        tokenStore.set(newAccessToken);
        console.log("Token refreshed successfully.");
        processQueue(null, newAccessToken);
        return newAccessToken;
    } catch (error) {
        console.error("Failed to refresh token:", error);
        tokenStore.clear();
        processQueue(error, null);
        window.location.href = '/login';
        throw error;
    } finally {
        isRefreshing = false;
    }
};


export default refreshClient;
