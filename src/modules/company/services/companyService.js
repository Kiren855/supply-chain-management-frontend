import apiClient from "@/core/api/apiClient";
import API_ENDPOINTS from "@/core/constants/apiEndpoints";

const companyService = {
    getAll: async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.COMPANY.GET_ALL);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Get companies failed");
        }
    },

    getById: async (id) => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.COMPANY.GET_BY_ID(id));
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Get company failed");
        }
    },

    update: async (companyData) => {
        try {
            const response = await apiClient.put(API_ENDPOINTS.COMPANY.UPDATE, companyData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Update company failed");
        }
    },
};

export default companyService;
