import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
    return (
        <div className="flex min-h-screen bg-gray-100 w-full">
            <Sidebar />
            <main className="flex-1 p-6 min-w-0">
                <Outlet />
            </main>
        </div>
    );
}