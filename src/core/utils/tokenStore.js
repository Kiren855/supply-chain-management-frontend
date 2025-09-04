export const tokenStore = {
    set: (token) => sessionStorage.setItem("access_token", token),
    get: () => sessionStorage.getItem("access_token"),
    clear: () => sessionStorage.removeItem("access_token"),
};
