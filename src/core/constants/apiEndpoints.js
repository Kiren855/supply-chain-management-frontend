const API_ENDPOINTS = {
    AUTH: {
        REGISTER: "http://localhost:8081/identity/api/v1/auth/root/register",
        LOGIN: "http://localhost:8081/identity/api/v1/auth/login",
        REFRESH_TOKEN: "http://localhost:8081/identity/api/v1/auth/refresh-token",
    },
    COMPANY: {
        GET_ALL: "http://localhost:8081/identity/api/v1/companies",
        GET_BY_ID: (id) => `http://localhost:8081/identity/api/v1/companies/${id}`,
        UPDATE: "http://localhost:8081/identity/api/v1/companies",
    },
    USER: {
        GET_PROFILE: "http://localhost:8081/identity/api/v1/users/me",
    },
};

export default API_ENDPOINTS;
