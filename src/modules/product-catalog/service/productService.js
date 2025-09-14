import apiClient from "@/core/api/apiClient";
import API_ENDPOINTS from "@/core/constants/apiEndpoints";

const productService = {
    /**
     * Lấy danh sách sản phẩm có phân trang.
     * @param {number} pageNumber - Số trang.
     * @param {number} pageSize - Kích thước trang.
     * @returns {Promise<any>}
     */
    getList: async (pageNumber, pageSize) => {
        const { data } = await apiClient.get(API_ENDPOINTS.PRODUCT.LIST, {
            params: { page: pageNumber, size: pageSize },
        });
        return data;
    },

    /**
     * Tạo một sản phẩm mới.
     * @param {object} payload - Dữ liệu của sản phẩm mới.
     * @returns {Promise<any>}
     */
    create: async (payload) => {
        const { data } = await apiClient.post(API_ENDPOINTS.PRODUCT.CREATE, payload);
        return data;
    },

    /**
     * Lấy thông tin chi tiết của một sản phẩm.
     * @param {string} productId - ID của sản phẩm.
     * @returns {Promise<any>}
     */
    getDetail: async (productId) => {
        const { data } = await apiClient.get(API_ENDPOINTS.PRODUCT.DETAIL(productId));
        return data;
    },

    /**
     * Cập nhật thông tin một sản phẩm.
     * @param {string} productId - ID của sản phẩm.
     * @param {object} payload - Dữ liệu cần cập nhật.
     * @returns {Promise<any>}
     */
    update: async (productId, payload) => {
        const { data } = await apiClient.patch(API_ENDPOINTS.PRODUCT.UPDATE(productId), payload);
        return data;
    },

    /**
     * Xóa một sản phẩm.
     * @param {string} productId - ID của sản phẩm.
     * @returns {Promise<any>}
     */
    delete: async (productId) => {
        const { data } = await apiClient.delete(API_ENDPOINTS.PRODUCT.DELETE(productId));
        return data;
    },

    // === CATEGORY APIs ===

    /**
     * Lấy danh sách tất cả category (có thể có phân trang).
     * @param {number} pageNumber - Số trang.
     * @param {number} pageSize - Kích thước trang.
     * @returns {Promise<any>}
     */
    getCategories: async (pageNumber, pageSize) => {
        const params = {};
        if (pageNumber !== undefined) params.page = pageNumber;
        if (pageSize !== undefined) params.size = pageSize;
        const { data } = await apiClient.get(API_ENDPOINTS.CATEGORY.LIST, { params });
        return data;
    },

    /**
     * Tạo một category mới.
     * @param {object} payload - Dữ liệu của category mới.
     * @returns {Promise<any>}
     */
    createCategory: async (payload) => {
        const { data } = await apiClient.post(API_ENDPOINTS.CATEGORY.CREATE, payload);
        return data;
    },

    /**
     * Lấy danh sách các category gốc (root).
     * @returns {Promise<any>}
     */
    getRootCategories: async () => {
        const { data } = await apiClient.get(API_ENDPOINTS.CATEGORY.GET_ROOT);
        return data;
    },

    /**
     * Lấy danh sách các category con của một category cha.
     * @param {string|number} categoryId - ID của category cha.
     * @returns {Promise<any>}
     */
    getChildCategories: async (categoryId) => {
        const { data } = await apiClient.get(API_ENDPOINTS.CATEGORY.GET_CHILDREN(categoryId));
        return data;
    },
};

export default productService;