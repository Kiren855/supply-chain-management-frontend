import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaLayerGroup, FaHistory, FaWarehouse, FaCube, FaChevronDown, FaSignOutAlt, FaUser } from "react-icons/fa";

// Menu items (tương tự sidebar nhưng tối ưu cho top bar)
const menuItems = [
    { name: "Dashboard", path: "/", icon: FaTachometerAlt, exact: true },
    {
        name: "User Management",
        icon: FaUsers,
        children: [
            { name: "Users", path: "users", icon: FaUsers },
            { name: "Groups", path: "groups", icon: FaLayerGroup },
        ],
    },
    {
        name: "Product Management", path: "products",
        icon: FaCube
    },
    {
        name: "Warehouse Management", path: "warehouses",
        icon: FaWarehouse
    },
    { name: "Activity Logs", path: "realtime-logs", icon: FaHistory },
];

export default function TopNavBar() {
    const [openDropdown, setOpenDropdown] = useState(null); // Quản lý dropdown mở
    const location = useLocation();

    const handleToggleDropdown = (menuName) => {
        setOpenDropdown(openDropdown === menuName ? null : menuName);
    };

    const navLinkClass = ({ isActive }) =>
        `flex items-center px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium
        ${isActive
            ? "bg-blue-200 text-blue-800"
            : "text-gray-700 hover:bg-blue-100 hover:text-gray-800"
        }`;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm"> {/* Thêm fixed top-0 left-0 right-0 z-50 */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <span className="text-xl font-bold text-blue-600">SCM</span>
                    </div>

                    {/* Menu Items */}
                    <div className="hidden md:flex space-x-4">
                        {menuItems.map((menu) => (
                            <div key={menu.name} className="relative">
                                {menu.children ? (
                                    // Menu có dropdown
                                    <button
                                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 hover:bg-blue-100 rounded-lg transition-colors"
                                        onClick={() => handleToggleDropdown(menu.name)}
                                    >
                                        <menu.icon className="w-4 h-4 mr-2" />
                                        {menu.name}
                                        <FaChevronDown className="w-3 h-3 ml-1" />
                                    </button>
                                ) : (
                                    // Menu không có dropdown
                                    <NavLink to={menu.path} className={navLinkClass} end={menu.exact}>
                                        <menu.icon className="w-4 h-4 mr-2" />
                                        {menu.name}
                                    </NavLink>
                                )}

                                {/* Dropdown */}
                                {menu.children && openDropdown === menu.name && (
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                        {menu.children.map((child) => (
                                            <NavLink
                                                key={child.name}
                                                to={`/${child.path}`}
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 hover:text-gray-800"
                                                onClick={() => setOpenDropdown(null)} // Đóng dropdown khi click
                                            >
                                                <child.icon className="w-4 h-4 mr-3" />
                                                {child.name}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* User Menu (Avatar và Logout) */}
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <button className="flex items-center text-gray-700 hover:text-gray-800">
                                <FaUser className="w-5 h-5 mr-2" />
                                <span className="hidden sm:block text-sm font-medium">User</span>
                                <FaChevronDown className="w-3 h-3 ml-1" />
                            </button>
                            {/* Có thể thêm dropdown cho user menu nếu cần */}
                        </div>
                        <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 hover:bg-red-100 rounded-lg transition-colors">
                            <FaSignOutAlt className="w-4 h-4 mr-2" />
                            <span className="hidden sm:block">Logout</span>
                        </button>
                    </div>

                    {/* Mobile Menu Button (nếu cần, có thể thêm hamburger menu cho mobile) */}
                    <div className="md:hidden">
                        <button className="text-gray-700 hover:text-gray-800">
                            <FaChevronDown className="w-5 h-5" />
                        </button>
                        {/* Có thể thêm mobile dropdown nếu cần */}
                    </div>
                </div>
            </div>
        </nav>
    );
}