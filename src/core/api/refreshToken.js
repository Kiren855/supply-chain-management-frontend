import axios from "axios";
import API_ENDPOINTS from "../constants/apiEndpoints";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000/identity/api/v1";

const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

export default refreshClient;
