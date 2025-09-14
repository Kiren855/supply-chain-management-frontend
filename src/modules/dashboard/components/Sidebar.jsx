import { useState, useEffect } from "react";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { NavLink, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaLayerGroup, FaHistory, FaWarehouse, FaCube } from "react-icons/fa";

// 1. CẤU TRÚC LẠI MENU ĐỂ NHẤT QUÁN
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
        name: "Warehouse Management",
        icon: FaWarehouse,
        children: [
            { name: "Warehouses", path: "warehouses", icon: FaWarehouse },
        ],
    },
    {
        name: "Product Management",
        icon: FaCube,
        children: [
            { name: "Products", path: "products", icon: FaCube },
        ],
    },
    { name: "Activity Logs", path: "realtime-logs", icon: FaHistory },
];


export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [openMenus, setOpenMenus] = useState({});
    const location = useLocation();

    // Tự động mở menu cha khi một menu con được active
    useEffect(() => {
        const activeMenu = menuItems.find(menu =>
            menu.children?.some(child => location.pathname.startsWith(`/${child.path}`))
        );
        if (activeMenu) {
            setOpenMenus(prev => ({ ...prev, [activeMenu.name]: true }));
        }
    }, [location.pathname]);


    const handleToggleMenu = (menuName) => {
        setOpenMenus((prev) => ({
            ...prev,
            [menuName]: !prev[menuName],
        }));
    };

    const navLinkClass = ({ isActive }) =>
        `flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200
        ${isActive
            ? "bg-blue-200 font-semibold text-blue-800"
            : "text-gray-600 hover:bg-blue-100 hover:text-gray-800"
        }`;

    return (
        <div className={`bg-white border-r border-gray-200 min-h-screen flex flex-col transition-all duration-300
        ${collapsed ? "w-20" : "w-64"} flex-shrink-0 shadow-sm`}>
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                {!collapsed && <span className="text-xl font-bold text-blue-600">SCM</span>}
                <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-full hover:bg-gray-200 focus:outline-none">
                    {collapsed ? <ChevronRightIcon className="w-6 h-6 text-gray-600" /> : <ChevronLeftIcon className="w-6 h-6 text-gray-600" />}
                </button>
            </div>

            <nav className="flex-1 p-2 space-y-1">
                {menuItems.map((menu) => (
                    <div key={menu.name} className="relative group">
                        {menu.children ? (
                            // Menu có con
                            <button
                                className={`w-full flex items-center px-4 py-2.5 rounded-lg text-left hover:bg-blue-100 transition-colors
                                    ${openMenus[menu.name] ? "font-semibold text-blue-700" : "text-gray-700"}
                                    ${collapsed ? "justify-center" : ""}
                                `}
                                onClick={() => handleToggleMenu(menu.name)}
                            >
                                <menu.icon className={`w-5 h-5 flex-shrink-0 ${!collapsed ? "mr-3" : ""}`} />
                                {!collapsed && (
                                    <>
                                        <span className="flex-1">{menu.name}</span>
                                        {openMenus[menu.name] ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                                    </>
                                )}
                            </button>
                        ) : (
                            // Menu không có con (link trực tiếp)
                            <NavLink to={menu.path} className={navLinkClass} end={menu.exact}>
                                <menu.icon className={`w-5 h-5 flex-shrink-0 ${!collapsed ? "mr-3" : ""}`} />
                                {!collapsed && <span>{menu.name}</span>}
                            </NavLink>
                        )}

                        {/* Sub menu */}
                        {menu.children && (
                            // 2. CẢI TIẾN HIỂN THỊ KHI THU GỌN
                            <div className={`
                                ${collapsed
                                    ? 'absolute left-full top-0 w-48 ml-2 p-2 bg-white rounded-lg shadow-xl hidden group-hover:block'
                                    : `pl-8 pr-2 pt-1 space-y-1 ${openMenus[menu.name] ? 'block' : 'hidden'}`
                                }
                            `}>
                                {menu.children.map((child) => (
                                    <NavLink key={child.name} to={`/${child.path}`} className={navLinkClass}>
                                        <child.icon className="w-4 h-4 mr-3" />
                                        <span>{child.name}</span>
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </div>
    );
}
