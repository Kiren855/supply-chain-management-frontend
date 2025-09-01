// src/routes/PrivateRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { tokenStore } from "../core/utils/tokenStore";

export default function PrivateRoute() {
    const token = tokenStore.get();

    // Nếu chưa login, redirect về /login hoặc /register
    if (!token) return <Navigate to="/register" replace />;

    // Nếu có token, render tất cả các route con
    return <Outlet />;
}
