import apiClient from "@/core/api/apiClient";
import API_ENDPOINTS from "@/core/constants/apiEndpoints";

// Hàm tiện ích để loại bỏ các tham số null/undefined
const cleanParams = (params) => {
    const cleaned = {};
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
            cleaned[key] = params[key];
        }
    });
    return cleaned;
};

const warehouseService = {
    /**
     * Lấy danh sách kho hàng với đầy đủ các tùy chọn.
     * @param {object} params - Các tham số bao gồm keyword, createdFrom, createdTo, page, size, sort.
     * @returns {Promise<any>}
     */
    getWarehouses: async (params) => {
        // Chỉ gửi các tham số có giá trị
        const { data } = await apiClient.get(API_ENDPOINTS.WAREHOUSE.LIST, {
            params: cleanParams(params)
        });
        return data;
    },

    /**
     * Tạo một kho hàng mới.
     * @param {object} warehouseData - Dữ liệu kho hàng mới { warehouse_name, location }.
     * @returns {Promise<any>}
     */
    createWarehouse: async (warehouseData) => {
        const { data } = await apiClient.post(API_ENDPOINTS.WAREHOUSE.CREATE, warehouseData);
        return data;
    },
};

export default warehouseService;