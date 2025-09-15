import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
    return (
        <div className="flex h-screen bg-gray-100 w-full overflow-hidden">
            <Sidebar />
            {/* Thẻ <main> bên ngoài chỉ lo việc cuộn */}
            <main className="flex-1 min-w-0 overflow-y-auto">
                {/* Thẻ <div> bên trong chỉ lo việc padding */}
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}