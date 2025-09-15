import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Register from "../modules/auth/pages/Register";
import Login from "../modules/auth/pages/Login";
import CompanyRegister from "../modules/company/pages/CompanyRegister";
import PrivateRoute from "./PrivateRoute";
import Show from "../modules/hello/Show";
import DashboardLayout from "@/modules/dashboard/components/DashboardLayout";
import Dashboard from "@/modules/dashboard/pages/Dashboard";
import UsersPage from "@/modules/user/pages/UsersPage";
import UserDetailPage from "@/modules/user/pages/UserDetailPage";
import GroupsPage from "@/modules/group/pages/GroupsPage";
import GroupDetail from "@/modules/group/pages/GroupDetail";
import CreateGroupPage from "@/modules/group/pages/CreateGroupPage";
import RealtimeLogsPage from "@/modules/logging/pages/RealtimeLogsPage";
import ProductPage from "@/modules/product-catalog/pages/ProductPage";
import CreateProductPage from "@/modules/product-catalog/pages/CreateProductPage";
import ProductDetailPage from "@/modules/product-catalog/pages/ProductDetailPage";
import WarehouseListPage from "@/modules/warehouse-management/pages/WarehouseListPage";
import ZoneListPage from '@/modules/warehouse-management/pages/ZoneListPage';

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                {/* Public routes */}
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                {/* All protected routes */}
                <Route element={<PrivateRoute />}>
                    <Route path="/company/register" element={<CompanyRegister />} />
                    <Route path="/show" element={<Show />} />

                    <Route path="/" element={<DashboardLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="users/:userId" element={<UserDetailPage />} />
                        <Route path="groups" element={<GroupsPage />} />
                        <Route path="groups/create" element={<CreateGroupPage />} />
                        <Route path="groups/:groupId" element={<GroupDetail />} />

                        <Route path="products" element={<ProductPage />} />
                        <Route path="products/create" element={<CreateProductPage />} />
                        <Route path="products/:productId" element={<ProductDetailPage />} />

                        <Route path="warehouses" element={<WarehouseListPage />} />
                        <Route path="/warehouses/:warehouseId/zones" element={<ZoneListPage />} />

                        <Route path="realtime-logs" element={<RealtimeLogsPage />} />
                    </Route>
                </Route>

                {/* Default redirect */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}
