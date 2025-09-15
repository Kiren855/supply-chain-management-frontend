import apiClient from "@/core/api/apiClient";
import API_ENDPOINTS from "@/core/constants/apiEndpoints";

// Hàm tiện ích để loại bỏ các tham số null/undefined/rỗng
const cleanParams = (params) => {
    const cleaned = {};
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
            cleaned[key] = params[key];
        }
    });
    return cleaned;
};

const zoneService = {
    /**
     * Lấy danh sách các khu vực (zone) trong một kho.
     * @param {number} warehouseId - ID của kho.
     * @param {object} params - Các tham số lọc và phân trang.
     * @returns {Promise<any>}
     */
    getZones: async (warehouseId, params) => {
        const { data } = await apiClient.get(API_ENDPOINTS.ZONE.LIST(warehouseId), {
            params: cleanParams(params)
        });
        return data;
    },

    /**
     * Tạo một khu vực mới trong kho.
     * @param {number} warehouseId - ID của kho.
     * @param {object} zoneData - Dữ liệu của khu vực mới (CreateZoneRequest).
     * @returns {Promise<any>}
     */
    createZone: async (warehouseId, zoneData) => {
        const { data } = await apiClient.post(API_ENDPOINTS.ZONE.CREATE(warehouseId), zoneData);
        return data;
    },

    /**
     * Cập nhật một khu vực trong kho.
     * @param {number} warehouseId - ID của kho.
     * @param {number} zoneId - ID của khu vực cần cập nhật.
     * @param {object} zoneData - Dữ liệu cập nhật (UpdateZoneRequest).
     * @returns {Promise<any>}
     */
    updateZone: async (warehouseId, zoneId, zoneData) => {
        const { data } = await apiClient.patch(API_ENDPOINTS.ZONE.UPDATE(warehouseId, zoneId), zoneData);
        return data;
    },

    /**
     * Xóa một khu vực trong kho.
     * @param {number} warehouseId - ID của kho.
     * @param {number} zoneId - ID của khu vực cần xóa.
     * @returns {Promise<any>}
     */
    deleteZone: async (warehouseId, zoneId) => {
        const { data } = await apiClient.delete(API_ENDPOINTS.ZONE.DELETE(warehouseId, zoneId));
        return data;
    },
};

export default zoneService;