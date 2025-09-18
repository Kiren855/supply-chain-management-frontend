import API_ENDPOINTS from "@/core/constants/apiEndpoints";
import apiClient from "@/core/api/apiClient";

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

    /**
     * Cập nhật thông tin kho hàng.
     * @param {number} warehouseId - ID của kho hàng cần cập nhật.
     * @param {object} warehouseData - Dữ liệu cập nhật.
     * @returns {Promise<any>}
     */
    updateWarehouse: async (warehouseId, warehouseData) => {
        const { data } = await apiClient.patch(API_ENDPOINTS.WAREHOUSE.UPDATE(warehouseId), warehouseData);
        return data;
    },

    /**
     * Lấy thông tin chi tiết của một kho hàng.
     * @param {number} warehouseId - ID của kho hàng.
     * @returns {Promise<any>}
     */
    getWarehouseById: async (warehouseId) => {
        const { data } = await apiClient.get(API_ENDPOINTS.WAREHOUSE.GET_BY_ID(warehouseId));
        return data;
    },

    /**
     * Lấy danh sách sản phẩm active trong kho (có tìm kiếm và phân trang).
     * @param {object} params - Các tham số bao gồm keyword, page, size.
     * @returns {Promise<any>}
     */
    getActiveProducts: async (params) => {
        const { data } = await apiClient.get(API_ENDPOINTS.PRODUCT.LIST_ACTIVE, {
            params: cleanParams(params),
        });
        return data;
    },

    /**
     * Lấy danh sách tất cả các package của một sản phẩm.
     * @param {number} productId - ID của sản phẩm.
     * @returns {Promise<any>}
     */
    getProductPackages: async (productId) => {
        const { data } = await apiClient.get(API_ENDPOINTS.PRODUCT.GET_PACKAGES(productId));
        return data;
    },

    /**
     * Lấy danh sách good receipts
     */
    getGoodReceipts: async (warehouseId, params = {}) => {
        const { data } = await apiClient.get(API_ENDPOINTS.WAREHOUSE.GET_GOOD_RECEIPTS(warehouseId), { params });
        return data;
    },

    /**
     * Lấy chi tiết 1 good receipt theo id (hoặc số)
     */
    getGoodReceiptById: async (warehouseId, receiptId) => {
        const { data } = await apiClient.get(API_ENDPOINTS.WAREHOUSE.GET_GOOD_RECEIPT_BY_ID(warehouseId, receiptId));
        return data;
    },

    /**
     * Tạo good receipt (nếu cần)
     */
    createGoodReceipt: async (warehouseId, payload) => {
        const { data } = await apiClient.post(API_ENDPOINTS.WAREHOUSE.CREATE_GOOD_RECEIPT(warehouseId), payload);
        return data;
    },

    /**
     * POST /warehouses/{warehouseId}/group-receipts
     * body: { receipt_ids: [1,2,3] } (GroupReceiptRequest)
     */
    processGroupReceipts: async (warehouseId, payload = {}) => {
        try {
            const { data } = await apiClient.post(API_ENDPOINTS.WAREHOUSE.PROCESS_GROUP_RECEIPTS(warehouseId), payload);
            return data;
        } catch (error) {
            console.error("processGroupReceipts error", error);
            throw error;
        }
    },

    /**
     * GET /warehouses/{warehouseId}/group-receipts
     * params: { page, size }
     */
    getGroupReceipts: async (warehouseId, params = {}) => {
        try {
            const { data } = await apiClient.get(API_ENDPOINTS.WAREHOUSE.GET_GROUP_RECEIPTS(warehouseId), { params });
            return data;
        } catch (error) {
            console.error("getGroupReceipts error", error);
            throw error;
        }
    },

    /**
     * Cancel a good receipt
     * POST /warehouses/{warehouseId}/good-receipts/{receiptId}/cancel
     */
    cancelGoodReceipt: async (warehouseId, receiptId) => {
        try {
            const { data } = await apiClient.post(API_ENDPOINTS.WAREHOUSE.CANCEL_GOOD_RECEIPT(warehouseId, receiptId));
            return data;
        } catch (error) {
            console.error("cancelGoodReceipt error", error);
            throw error;
        }
    },

    cancelGroupReceipt: async (warehouseId, groupReceiptId) => {
        try {
            const { data } = await apiClient.post(API_ENDPOINTS.WAREHOUSE.CANCEL_GROUP_RECEIPT(warehouseId, groupReceiptId));
            return data;
        } catch (error) {
            console.error("cancelGroupReceipt error", error);
            throw error;
        }
    },

    /**
     * Download putaway PDF for a group receipt
     * GET /warehouse/api/v1/group-receipts/{id}/download
     * returns binary (arraybuffer)
     */
    downloadGroupReceiptPutaway: async (groupReceiptId) => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.WAREHOUSE.DOWNLOAD_GROUP_RECEIPT_PUTAWAY(groupReceiptId), {
                responseType: "arraybuffer"
            });
            return response.data;
        } catch (error) {
            console.error("downloadGroupReceiptPutaway error", error);
            throw error;
        }
    },
};

export default warehouseService;