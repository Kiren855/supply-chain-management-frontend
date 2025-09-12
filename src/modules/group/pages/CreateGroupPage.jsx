import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import groupService from "@/modules/group/service/groupService";
import userService from "@/modules/user/services/userService";
import Pagination from "@/components/common/Pagination";
import { useToast } from "@/contexts/ToastContext";
import { FaArrowLeft, FaSave } from "react-icons/fa";

export default function CreateGroupPage() {
    const [groupName, setGroupName] = useState("");
    const [allRoles, setAllRoles] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    const fetchAllRoles = async (pageNumber = 0) => {
        setLoading(true);
        try {
            // Sử dụng userService để lấy danh sách tất cả các role
            const response = await userService.getRoles(pageNumber, size);
            setAllRoles(response.result.content);
            setTotalPages(response.result.totalPages);
            setPage(response.result.pageNumber);
        } catch (error) {
            console.error("Failed to fetch roles:", error);
            addToast("Failed to load roles.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllRoles(0);
    }, []);

    const handleSelectRole = (roleId) => {
        setSelectedRoles((prev) =>
            prev.includes(roleId)
                ? prev.filter((id) => id !== roleId)
                : [...prev, roleId]
        );
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            addToast("Group name is required.", "error");
            return;
        }
        try {
            await groupService.create({
                group_name: groupName,
                roles: selectedRoles,
            });
            addToast("Group created successfully!", "success");
            navigate("/groups"); // Quay về trang danh sách group
        } catch (error) {
            console.error("Failed to create group:", error);
            addToast(error.response?.data?.message || "Failed to create group.", "error");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200 transition">
                    <FaArrowLeft className="text-gray-600" />
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Create New Group</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-8">
                {/* Phần nhập tên Group */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-x-6 gap-y-2">
                    <h2 className="text-xl font-semibold text-gray-700 md:col-span-1">
                        Group Name
                    </h2>
                    <div className="md:col-span-3">
                        <input
                            type="text"
                            id="groupName"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Enter a name for the new group"
                            className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Phần chọn Roles */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-700">Assign Roles</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="w-12 px-4 py-2"></th>
                                    <th className="w-1/4 px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Role Name</th>
                                    <th className="w-3/4 px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr><td colSpan="3" className="text-center py-8 text-gray-500">Loading roles...</td></tr>
                                ) : (
                                    allRoles.map((role) => (
                                        <tr
                                            key={role.id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => handleSelectRole(role.id)}
                                        >
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                                                    checked={selectedRoles.includes(role.id)}
                                                    readOnly
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-800">{role.role_name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{role.description || "--------"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={fetchAllRoles}
                    />
                </div>
            </div>

            {/* Nút Create */}
            <div className="flex justify-end">
                <button
                    onClick={handleCreateGroup}
                    disabled={!groupName.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaSave />
                    Create Group
                </button>
            </div>
        </div>
    );
}