import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { tokenStore } from "@/core/utils/tokenStore";
import { initAuth } from "@/core/services/authInit";

export default function PrivateRoute() {
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const valid = await initAuth();
            setIsAuth(valid);
            setLoading(false);
        };
        checkAuth();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!isAuth) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
