import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import userService from "@/modules/user/services/userService";
import { FaUserCircle, FaLock, FaToggleOn, FaUsers } from "react-icons/fa";

export default function UserDetailPage() {
    const { userId } = useParams();
    const location = useLocation();
    const { username, is_active } = location.state || {};

    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await userService.getUserRoles(userId);
                setRoles(response.result || []);
            } catch (error) {
                console.error("Failed to fetch roles:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRoles();
    }, [userId]);

    if (loading) return <div className="text-center py-10">Loading...</div>;

    return (
        <div className="flex max-w-5xl mx-auto p-6 gap-8">
            {/* Thông tin user */}
            <div className="flex-1 space-y-8">
                <h1 className="text-2xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <FaUserCircle className="text-blue-500 text-4xl" />
                    <div className="flex items-center gap-3">
                        <span className="text-gray-600">{username}</span>
                        <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold shadow
                                ${is_active
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                        >
                            {is_active ? "Active" : "Inactive"}
                        </span>
                    </div>
                    <span className="text-xs text-gray-400">ID: {userId}</span>
                </h1>

                {/* Roles Card */}
                <div className="bg-white shadow-md rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-blue-400 rounded-full"></span>
                        Roles
                    </h2>
                    {roles.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {roles.map((r, idx) => (
                                <span
                                    key={idx}
                                    className="px-4 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full shadow hover:bg-blue-200 transition"
                                >
                                    {r.role_name}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No roles assigned.</p>
                    )}
                </div>
            </div>

            {/* Sidebar chức năng */}
            <div className="w-64 bg-white shadow-md rounded-2xl p-6 flex flex-col gap-4 h-fit">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Actions</h2>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition">
                    <FaLock /> Change Password
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium transition">
                    <FaToggleOn /> Toggle Active
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 font-medium transition">
                    <FaUsers /> Assign Group
                </button>
            </div>
        </div>
    );
}
