import apiClient from "@/core/api/apiClient";
import API_ENDPOINTS from "@/core/constants/apiEndpoints";
import { tokenStore } from "@/core/utils/tokenStore";


const authService = {
    register: async (email, password) => {
        const { data } = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, { email, password });
        return data;
    },
    registerSub: async (username, password) => {
        const { data } = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER_SUB, { username, password });
        return data;
    },

    login: async (email, password) => {
        const { data } = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
        // backend trả về { accessToken }, refresh token nằm trong HttpOnly cookie
        if (data?.result.access_token) tokenStore.set(data.result.access_token);
        return data;
    },

    logout: async () => {
        try {
            await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
        } finally {
            tokenStore.clear();
        }
    },
};

export default authService;
