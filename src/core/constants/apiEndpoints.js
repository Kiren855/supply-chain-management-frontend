const API_ENDPOINTS = {
    AUTH: {
        REGISTER: "http://localhost:9000/identity/api/v1/auth/root/register",
        LOGIN: "http://localhost:9000/identity/api/v1/auth/login",
        REFRESH_TOKEN: "http://localhost:9000/identity/api/v1/auth/refresh",
    },
    COMPANY: {
        GET_ALL: "http://localhost:9000/identity/api/v1/companies",
        GET_BY_ID: (id) => `http://localhost:9000/identity/api/v1/companies/${id}`,
        UPDATE: "http://localhost:9000/identity/api/v1/companies",
    },
    USER: {
        LIST: "http://localhost:9000/identity/api/v1/users",
        CREATE: "http://localhost:9000/identity/api/v1/users",
        DELETE: (id) => `http://localhost:9000/identity/api/v1/users/${id}`,
    },
};

export default API_ENDPOINTS;
