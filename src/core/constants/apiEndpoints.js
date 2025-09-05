const API_ENDPOINTS = {
    AUTH: {
        REGISTER: "http://localhost:9000/identity/api/v1/auth/root/register",
        REGISTER_SUB: "http://localhost:9000/identity/api/v1/auth/sub/register",
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
        TOGGLE_ACTIVE: (id) => `http://localhost:9000/identity/api/v1/users/${id}/toggle-active`,
        ROLES: (id) => `http://localhost:9000/identity/api/v1/users/${id}/roles`,
    },
    GROUP: {
        LIST: "http://localhost:9000/identity/api/v1/groups",
        CREATE: "http://localhost:9000/identity/api/v1/groups",
        DETAIL: (groupId) => `http://localhost:9000/identity/api/v1/groups/${groupId}`,
        UPDATE: (groupId) => `http://localhost:9000/identity/api/v1/groups/${groupId}`,
        DELETE: (groupId) => `http://localhost:9000/identity/api/v1/groups/${groupId}`,
        ADD_USER: (groupId, userId) => `http://localhost:9000/identity/api/v1/groups/${groupId}/users/${userId}`,
        ADD_USERS: (groupId) => `http://localhost:9000/identity/api/v1/groups/${groupId}/users`,
        REMOVE_USERS: (groupId) => `http://localhost:9000/identity/api/v1/groups/${groupId}/users`,
        REMOVE_USER: (groupId, userId) => `http://localhost:9000/identity/api/v1/groups/${groupId}/users/${userId}`,
        ADD_ROLES: (groupId) => `http://localhost:9000/identity/api/v1/groups/${groupId}/roles`,
        REMOVE_ROLES: (groupId) => `http://localhost:9000/identity/api/v1/groups/${groupId}/roles`,
        GET_USERS: (groupId) => `http://localhost:9000/identity/api/v1/groups/${groupId}/users`,
        GET_ROLES: (groupId) => `http://localhost:9000/identity/api/v1/groups/${groupId}/roles`,
    },
    ROLE: {
        LIST: "http://localhost:9000/identity/api/v1/roles",
    }
};

export default API_ENDPOINTS;
