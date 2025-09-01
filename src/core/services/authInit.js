import { tokenStore } from "../utils/tokenStore";
import refreshClient from "../api/refreshToken";
import API_ENDPOINTS from "../constants/apiEndpoints";

export const initAuth = async () => {
    try {
        const { data } = await refreshClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);

        if (data?.result.access_token) {
            tokenStore.set(data.result.access_token);
            console.log("Access token restored from refresh token");
            return true;
        } else {
            throw new Error("No access token returned from refresh");
        }
    } catch (err) {
        tokenStore.clear();
        console.log("User not logged in or refresh failed");
        return false;
    }
};