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
import ProductsPage from "@/modules/product-catalog/pages/ProductPage"; // 1. Import trang danh sách sản phẩm

// Placeholder pages for product module
const CreateProductPage = () => <div className="p-8"><h1 className="text-2xl">Create New Product Page</h1></div>;
const ProductDetailPage = () => <div className="p-8"><h1 className="text-2xl">Product Detail Page</h1></div>;


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

                        {/* 2. Thêm các route cho Product Catalog */}
                        <Route path="products" element={<ProductsPage />} />
                        <Route path="products/create" element={<CreateProductPage />} />
                        <Route path="products/:productId" element={<ProductDetailPage />} />

                        <Route path="realtime-logs" element={<RealtimeLogsPage />} />
                    </Route>
                </Route>

                {/* Default redirect */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}
