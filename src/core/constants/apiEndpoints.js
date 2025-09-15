import { UPDATE } from "react-admin";

const API_ENDPOINTS = {
    AUTH: {
        REGISTER: "http://localhost:9000/identity/api/v1/auth/root/register",
        REGISTER_SUB: "http://localhost:9000/identity/api/v1/auth/sub/register",
        LOGIN: "http://localhost:9000/identity/api/v1/auth/login",
        REFRESH_TOKEN: "http://localhost:9000/identity/api/v1/auth/refresh",
        CHANGE_SUB_PASSWORD: (userId) => `http://localhost:9000/identity/api/v1/auth/${userId}/change-password`,
        CHANGE_ROOT_PASSWORD: "http://localhost:9000/identity/api/v1/auth/change-password",
        LOGOUT: "http://localhost:9000/identity/api/v1/auth/logout",
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
    },
    LOGGING: {
        GET_LATEST: "http://localhost:9000/logging/api/v1/logs/latest",
        GET_OLDER: "http://localhost:9000/logging/api/v1/logs/older",
        EXPORT_CSV: "http://localhost:9000/logging/api/v1/logs/export",
    },
    PRODUCT: {
        LIST: "http://localhost:9000/product/api/v1/products",
        CREATE: "http://localhost:9000/product/api/v1/products",
        DETAIL: (productId) => `http://localhost:9000/product/api/v1/products/${productId}`,
        UPDATE: (productId) => `http://localhost:9000/product/api/v1/products/${productId}`,
        DELETE: (productId) => `http://localhost:9000/product/api/v1/products/${productId}`,
        GET_PACKAGES: (productId) => `http://localhost:9000/product/api/v1/products/${productId}/packages`,
        DELETE_PACKAGE: (productId) => `http://localhost:9000/product/api/v1/products/${productId}/packages`,
        UPDATE_PACKAGE: (productId, packageId) => `http://localhost:9000/product/api/v1/products/${productId}/packages/${packageId}`,
        CREATE_PACKAGE: (productId) => `http://localhost:9000/product/api/v1/products/${productId}/packages`,


    },
    CATEGORY: {
        LIST: "http://localhost:9000/product/api/v1/categories",
        CREATE: "http://localhost:9000/product/api/v1/categories",
        GET_ROOT: "http://localhost:9000/product/api/v1/categories/root",
        GET_CHILDREN: (categoryId) => `http://localhost:9000/product/api/v1/categories/${categoryId}/children`,
    },

    WAREHOUSE: {
        LIST: "http://localhost:9000/warehouse/api/v1/warehouses",
        CREATE: "http://localhost:9000/warehouse/api/v1/warehouses",
        GET_BY_ID: (warehouseId) => `http://localhost:9000/warehouse/api/v1/warehouses/${warehouseId}`,
        UPDATE: (warehouseId) => `http://localhost:9000/warehouse/api/v1/warehouses/${warehouseId}`,
        DELETE: (warehouseId) => `http://localhost:9000/warehouse/api/v1/warehouses/${warehouseId}`,
    },

    ZONE: {
        LIST: (warehouseId) => `http://localhost:9000/warehouse/api/v1/warehouses/${warehouseId}/zones`,
        CREATE: (warehouseId) => `http://localhost:9000/warehouse/api/v1/warehouses/${warehouseId}/zones`,
        GET_BY_ID: (warehouseId, zoneId) => `http://localhost:9000/warehouse/api/v1/warehouses/${warehouseId}/zones/${zoneId}`,
        UPDATE: (warehouseId, zoneId) => `http://localhost:9000/warehouse/api/v1/warehouses/${warehouseId}/zones/${zoneId}`,
        DELETE: (warehouseId, zoneId) => `http://localhost:9000/warehouse/api/v1/warehouses/${warehouseId}/zones/${zoneId}`,
    },
};

export default API_ENDPOINTS;
