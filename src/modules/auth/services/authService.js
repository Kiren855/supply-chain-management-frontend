import apiClient from "@/core/api/apiClient";
import authApiClient from "@/core/api/authApiClient";
import API_ENDPOINTS from "@/core/constants/apiEndpoints";
import { tokenStore } from "@/core/utils/tokenStore";


const authService = {
    register: async (email, password) => {
        const { data } = await authApiClient.post(API_ENDPOINTS.AUTH.REGISTER, { email, password });
        return data;
    },
    registerSub: async (username, password) => {
        const { data } = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER_SUB, { username, password });
        return data;
    },

    login: async (email, password) => {
        const { data } = await authApiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });

        if (data?.result.access_token) tokenStore.set(data.result.access_token);
        return data;
    },

    changeSubPassword: async (userId, newPassword) => {
        const { data } = await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_SUB_PASSWORD(userId), { new_password: newPassword });
        return data;
    },

    changeRootPassword: async (newPassword) => {
        const { data } = await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_ROOT_PASSWORD, { new_password: newPassword });
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
