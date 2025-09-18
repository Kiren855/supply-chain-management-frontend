import { useState } from "react";
import { NavLink, useParams, Outlet } from "react-router-dom";
import { FaTachometerAlt, FaLayerGroup, FaClipboardList, FaExclamationTriangle, FaBoxes, FaArrowLeft, FaBars } from "react-icons/fa"; // Thêm FaBars cho nút toggle

// Menu items cho sidebar warehouse
const menuItems = [
    { name: "Overview", path: "overview", icon: FaTachometerAlt },
    { name: "Zones & Bins", path: "zones", icon: FaLayerGroup },
    { name: "Receipts", path: "good-receipts", icon: FaClipboardList }, // sẽ hiển thị submenu riêng
    { name: "Issues", path: "good-issues", icon: FaExclamationTriangle },
    { name: "Inventory", path: "inventory", icon: FaBoxes },
];

export default function WarehouseDetailLayout() {
    const { warehouseId } = useParams();
    const [sidebarOpen, setSidebarOpen] = useState(true); // Trạng thái mở/đóng sidebar

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar cố định */}
            <div
                className={`fixed top-16 left-0 h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"
                    }`}
            >
                <div className="p-4 border-b flex items-center justify-between">
                    <NavLink to="/warehouses" className="flex items-center gap-2 text-blue-600 hover:underline">
                        <FaArrowLeft className="w-4 h-4" />
                        <span className={sidebarOpen ? "block" : "hidden"}>Back to Warehouses</span>
                    </NavLink>
                    {/* Nút toggle sidebar */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-600 hover:text-gray-800 focus:outline-none"
                    >
                        <FaBars className="w-5 h-5" />
                    </button>
                </div>
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => (
                        <div key={item.name}>
                            <NavLink
                                to={`/warehouses/${warehouseId}/${item.path}`}
                                className={({ isActive }) =>
                                    `flex items-center px-3 py-2 rounded-lg transition-colors text-sm font-medium ${isActive
                                        ? "bg-blue-200 text-blue-800"
                                        : "text-gray-700 hover:bg-blue-100 hover:text-gray-800"
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                <span className={sidebarOpen ? "block" : "hidden"}>{item.name}</span>
                            </NavLink>

                            {/* Submenu cho Receipts */}
                            {item.path === "good-receipts" && sidebarOpen && (
                                <div className="ml-8 mt-1 flex flex-col gap-1">
                                    <NavLink
                                        to={`/warehouses/${warehouseId}/good-receipts`}
                                        end
                                        className={({ isActive }) => `px-2 py-1 rounded-md text-sm ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        Receipts (Pending)
                                    </NavLink>
                                    <NavLink
                                        to={`/warehouses/${warehouseId}/good-receipts/confirm`}
                                        className={({ isActive }) => `px-2 py-1 rounded-md text-sm ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        Group Receipts (Confirm)
                                    </NavLink>
                                    <NavLink
                                        to={`/warehouses/${warehouseId}/good-receipts/complete`}
                                        className={({ isActive }) => `px-2 py-1 rounded-md text-sm ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        Group Receipts (Complete)
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            {/* Main content */}
            <div
                className={`transition-all duration-300`}
                style={{
                    marginLeft: sidebarOpen ? "16rem" : "4rem", // Tương ứng với w-64 (16rem) và w-16 (4rem)
                }}
            >
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}