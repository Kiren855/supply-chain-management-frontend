import apiClient from "@/core/api/apiClient";
import API_ENDPOINTS from "@/core/constants/apiEndpoints";

/**
 * Helper để chuyển đổi đối tượng Date thành chuỗi YYYY-MM-DDTHH:mm:ss
 * @param {Date} date 
 * @returns {string}
 */
const formatToLocalISOString = (date) => {
    const pad = (num) => num.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};


const logService = {
    /**
     * Lấy các log gần nhất trong một khoảng thời gian.
     * @param {Date} start Thời gian bắt đầu
     * @param {Date} end Thời gian kết thúc
     * @returns {Promise<any>} Dữ liệu trả về từ API
     */
    getLatestLogs: async (start, end) => {
        const { data } = await apiClient.get(API_ENDPOINTS.LOGGING.GET_LATEST, {
            params: {
                start: formatToLocalISOString(start),
                end: formatToLocalISOString(end)
            }
        });
        return data;
    },

    /**
     * Lấy các log cũ hơn một thời điểm nhất định.
     * @param {string} lastTimestamp - Chuỗi timestamp của log cuối cùng.
     * @returns {Promise<any>} Dữ liệu trả về từ API
     */
    getOlderLogs: async (lastTimestamp) => {
        const { data } = await apiClient.get(API_ENDPOINTS.LOGGING.GET_OLDER, {
            params: {
                last: lastTimestamp
            }
        });
        return data;
    },

    /**
     * Gọi API để export log ra file CSV.
     * @param {Date} start Thời gian bắt đầu
     * @param {Date} end Thời gian kết thúc
     * @returns {Promise<any>} Dữ liệu blob của file CSV.
     */
    exportLogsToCsv: async (start, end) => {
        const response = await apiClient.get(API_ENDPOINTS.LOGGING.EXPORT_CSV, {
            params: {
                start: formatToLocalISOString(start),
                end: formatToLocalISOString(end)
            },
            responseType: 'blob',
        });
        return response.data;
    },
};

export default logService;