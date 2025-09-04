import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Register from "../modules/auth/pages/Register";
import Login from "../modules/auth/pages/Login";
import CompanyRegister from "../modules/company/pages/CompanyRegister";
import PrivateRoute from "./PrivateRoute";
import Show from "../modules/hello/Show";


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

                    {/* Dashboard + React Admin
                    <Route path="/dashboard/*" element={<Dashboard />} /> */}
                </Route>

                {/* Default redirect */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}
