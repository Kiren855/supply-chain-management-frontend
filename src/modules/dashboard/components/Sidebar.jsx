import { useState } from "react";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    HomeIcon,
    UsersIcon,
    CubeIcon,
    BuildingStorefrontIcon,
    ClockIcon,
    Cog6ToothIcon,

} from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaLayerGroup, FaHistory } from "react-icons/fa";

const menuItems = [
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
        icon: BuildingStorefrontIcon,
        children: [
            { name: "Warehouses", path: "warehouses", icon: BuildingStorefrontIcon },
        ],
    },
    {
        name: "Product Management",
        icon: CubeIcon,
        children: [
            { name: "Products", path: "products", icon: CubeIcon },
        ],
    },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [openMenus, setOpenMenus] = useState({});

    const handleToggleMenu = (menuName) => {
        setOpenMenus((prev) => ({
            ...prev,
            [menuName]: !prev[menuName],
        }));
    };

    const navLinkClass = ({ isActive }) =>
        `flex items-center px-6 py-3 mt-4 transition-colors duration-300 transform ${isActive
            ? "text-gray-700 bg-gray-200"
            : "text-gray-600 hover:bg-gray-200 hover:text-gray-700"
        }`;

    return (
        <div className={`bg-gradient-to-b from-blue-50 to-white border-r border-gray-200 min-h-screen flex flex-col transition-all duration-300
        ${collapsed ? "min-w-[4rem] w-[4rem]" : "min-w-[16rem] w-[16rem]"} flex-shrink-0 shadow-lg`}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                {!collapsed && <span className="text-2xl font-bold text-blue-600 tracking-wide">SCM</span>}
                <button onClick={() => setCollapsed(!collapsed)} className="focus:outline-none">
                    {collapsed ? <ChevronRightIcon className="w-6 h-6 text-gray-600" /> : <ChevronLeftIcon className="w-6 h-6 text-gray-600" />}
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((menu) => (
                    <div key={menu.name}>
                        <button
                            className={`w-full flex items-center px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors
                                ${openMenus[menu.name] ? "bg-blue-100 font-semibold text-blue-600" : "text-gray-700"}
                                ${collapsed ? "justify-center" : ""}
                            `}
                            onClick={() => handleToggleMenu(menu.name)}
                        >
                            <menu.icon className="w-5 h-5 mr-3" />
                            {!collapsed && (
                                <>
                                    <span className="flex-1 text-left">{menu.name}</span>
                                    {openMenus[menu.name] ? (
                                        <ChevronUpIcon className="w-4 h-4" />
                                    ) : (
                                        <ChevronDownIcon className="w-4 h-4" />
                                    )}
                                </>
                            )}
                        </button>
                        {/* Sub menu */}
                        {!collapsed && openMenus[menu.name] && (
                            <div className="ml-8 mt-1 space-y-1">
                                {menu.children.map((child) => (
                                    <NavLink
                                        key={child.name}
                                        to={child.path}
                                        className={({ isActive }) =>
                                            `flex items-center px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors
                                            ${isActive ? "bg-blue-200 font-semibold text-blue-700" : "text-gray-600"}`
                                        }
                                    >
                                        <child.icon className="w-4 h-4 mr-2" />
                                        <span>{child.name}</span>
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                <div className="border-t border-gray-200 my-4"></div>
                <NavLink to="/" className={navLinkClass} end>
                    <FaTachometerAlt className="w-6 h-6" />
                    <span className="mx-4">Dashboard</span>
                </NavLink>

                <NavLink to="realtime-logs" className={navLinkClass}>
                    <FaHistory className="w-6 h-6" />
                    <span className="mx-4">Activity Logs</span>
                </NavLink>
            </nav>
        </div>
    );
}
