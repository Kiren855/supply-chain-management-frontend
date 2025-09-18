import TopNavBar from "./TopNavBar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
    return (
        <div className="min-h-screen bg-gray-100">
            <TopNavBar /> {/* Thanh menu trên cùng */}
            <main className="pt-8"> {/* Thêm pt-16 để margin nội dung xuống dưới TopNavBar */}
                <Outlet />
            </main>
        </div>
    );
}