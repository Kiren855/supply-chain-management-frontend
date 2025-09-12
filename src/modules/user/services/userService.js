import apiClient from "@/core/api/apiClient";
import API_ENDPOINTS from "@/core/constants/apiEndpoints";

const userService = {
    getList: async (page, size) => {
        const { data } = await apiClient.get(API_ENDPOINTS.USER.LIST, {
            params: { page, size },
        });
        return data;
    },

    addUser: async (groupId, userId) => {
        const { data } = await apiClient.post(API_ENDPOINTS.GROUP.ADD_USER(groupId, userId));
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
