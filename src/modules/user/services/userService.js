import apiClient from "@/core/api/apiClient";
import API_ENDPOINTS from "@/core/constants/apiEndpoints";

const userService = {
    getList: async (page, size) => {
        const { data } = await apiClient.get(API_ENDPOINTS.USER.LIST, {
            params: { page, size },
        });
        return data;
    },

    getUserRoles: async (userId) => {
        const { data } = await apiClient.get(`${API_ENDPOINTS.USER.ROLES(userId)}`);
        return data;
    },
    getRoles: async (page, size) => {
        const { data } = await apiClient.get(API_ENDPOINTS.ROLE.LIST, {
            params: { page, size },
        });
        return data;
    }
};

export default userService;
