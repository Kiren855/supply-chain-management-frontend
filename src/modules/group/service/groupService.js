import apiClient from "@/core/api/apiClient";
import API_ENDPOINTS from "@/core/constants/apiEndpoints";

const groupService = {
    getList: async (page, size) => {
        const { data } = await apiClient.get(API_ENDPOINTS.GROUP.LIST, {
            params: { page, size },
        });
        return data;
    },

    getDetail: async (groupId) => {
        const { data } = await apiClient.get(API_ENDPOINTS.GROUP.DETAIL(groupId));
        return data;
    },

    create: async (payload) => {
        const { data } = await apiClient.post(API_ENDPOINTS.GROUP.CREATE, payload);
        return data;
    },

    update: async (groupId, payload) => {
        const { data } = await apiClient.patch(API_ENDPOINTS.GROUP.UPDATE(groupId), payload);
        return data;
    },

    delete: async (groupId) => {
        const { data } = await apiClient.delete(API_ENDPOINTS.GROUP.DELETE(groupId));
        return data;
    },

    addUser: async (groupId, userId) => {
        const { data } = await apiClient.post(API_ENDPOINTS.GROUP.ADD_USER(groupId, userId));
        return data;
    },

    addUsers: async (groupId, payload) => {
        const { data } = await apiClient.post(API_ENDPOINTS.GROUP.ADD_USERS(groupId), payload);
        return data;
    },

    removeUser: async (groupId, userId) => {
        const { data } = await apiClient.delete(API_ENDPOINTS.GROUP.REMOVE_USER(groupId, userId));
        return data;
    },

    addRoles: async (groupId, payload) => {
        const { data } = await apiClient.post(API_ENDPOINTS.GROUP.ADD_ROLES(groupId), payload);
        return data;
    },

    removeRoles: async (groupId, payload) => {
        const { data } = await apiClient.delete(API_ENDPOINTS.GROUP.REMOVE_ROLES(groupId), { data: payload });
        return data;
    },

    removeUsers: async (groupId, payload) => {
        const { data } = await apiClient.delete(API_ENDPOINTS.GROUP.REMOVE_USERS(groupId), { data: payload });
        return data;
    },

    getUsers: async (groupId, params) => {
        const { data } = await apiClient.get(API_ENDPOINTS.GROUP.GET_USERS(groupId), { params });
        return data;
    },

    getRoles: async (groupId, params) => {
        const { data } = await apiClient.get(API_ENDPOINTS.GROUP.GET_ROLES(groupId), { params });
        return data;
    },
};

export default groupService;