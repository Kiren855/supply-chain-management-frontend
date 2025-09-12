import { tokenStore } from "@/core/utils/tokenStore";
import refreshClient from "@/core/api/refreshToken";
import API_ENDPOINTS from "@/core/constants/apiEndpoints";

export const initAuth = async () => {
    let token = tokenStore.get();
    if (!token) {
        try {
            const { data } = await refreshClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
            token = data?.result?.access_token;
            if (token) tokenStore.set(token);
            return !!token;
        } catch {
            tokenStore.clear();
            return false;
        }
    }
    return true;
};
