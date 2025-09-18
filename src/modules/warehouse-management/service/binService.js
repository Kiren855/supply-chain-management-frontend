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

const binService = {
    /**
     * Lấy danh sách các ngăn (bin) trong một khu vực.
     * @param {number} zoneId - ID của khu vực.
     * @param {object} params - Các tham số lọc và phân trang (keyword, createdFrom, createdTo, binType, binStatus, page, size, sort).
     * @returns {Promise<any>}
     */
    getBins: async (zoneId, params) => {
        const { data } = await apiClient.get(API_ENDPOINTS.BIN.LIST(zoneId), {
            params: cleanParams(params)
        });
        return data;
    },

    /**
     * Lấy thông tin chi tiết của một ngăn.
     * @param {number} zoneId - ID của khu vực.
     * @param {number} binId - ID của ngăn.
     * @returns {Promise<any>}
     */
    getBinById: async (zoneId, binId) => {
        const { data } = await apiClient.get(API_ENDPOINTS.BIN.GET_BY_ID(zoneId, binId));
        return data;
    },

    /**
     * Tạo một ngăn mới trong khu vực.
     * @param {number} zoneId - ID của khu vực.
     * @param {object} binData - Dữ liệu của ngăn mới (CreateBinRequest).
     * @returns {Promise<any>}
     */
    createBin: async (zoneId, binData) => {
        const { data } = await apiClient.post(API_ENDPOINTS.BIN.CREATE(zoneId), binData);
        return data;
    },

    /**
     * Cập nhật một ngăn trong khu vực.
     * @param {number} zoneId - ID của khu vực.
     * @param {number} binId - ID của ngăn cần cập nhật.
     * @param {object} binData - Dữ liệu cập nhật (UpdateBinRequest).
     * @returns {Promise<any>}
     */
    updateBin: async (zoneId, binId, binData) => {
        const { data } = await apiClient.patch(API_ENDPOINTS.BIN.UPDATE(zoneId, binId), binData);
        return data;
    },
};

export default binService;