import { useEffect, useState } from "react";
import userService from "@/modules/user/services/userService";
import groupService from "@/modules/group/service/groupService";
import { FaTimes } from "react-icons/fa";

export default function AddRoleModal({ isOpen, onClose, groupId, onSuccess }) {
    const [allRoles, setAllRoles] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]); // Sẽ chứa danh sách các ID
    const [page, setPage] = useState(0);
    const [size] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchAllRoles = async (pageNumber = 0) => {
        setLoading(true);
        try {
            const response = await userService.getRoles(pageNumber, size);
            setAllRoles(response.result.content);
            setTotalPages(response.result.totalPages);
            setPage(response.result.pageNumber);
        } catch (error) {
            console.error("Failed to fetch roles:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchAllRoles(0);
            setSelectedRoles([]); // Reset selection when modal opens
        }
    }, [isOpen]);

    // Sửa lại để xử lý với role ID
    const handleSelectRole = (roleId) => {
        setSelectedRoles((prev) =>
            prev.includes(roleId)
                ? prev.filter((id) => id !== roleId)
                : [...prev, roleId]
        );
    };

    const handleSave = async () => {
        if (selectedRoles.length === 0) return;
        try {
            // Gửi đi danh sách các ID đã chọn
            await groupService.addRoles(groupId, { roles: selectedRoles });
            onSuccess(); // Callback để refresh danh sách roles của group
        } catch (error) {
            console.error("Failed to add roles to group:", error);
        }
    };

    const handlePrev = () => {
        if (page > 0) fetchAllRoles(page - 1);
    };

    const handleNext = () => {
        if (page < totalPages - 1) fetchAllRoles(page + 1);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 space-y-4">
                {/* ... Header ... */}
                <div className="flex justify-between items-center border-b pb-2">
                    <h2 className="text-2xl font-bold text-gray-800">Add Roles to Group</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Table of Roles */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* ... thead ... */}
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="w-12 px-4 py-2"></th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Role Name</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="3" className="text-center py-4">Loading...</td></tr>
                            ) : (
                                allRoles.map((role) => (
                                    <tr key={role.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                // Sửa lại để kiểm tra và xử lý với role.id
                                                checked={selectedRoles.includes(role.id)}
                                                onChange={() => handleSelectRole(role.id)}
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{role.role_name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{role.description || "N/A"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ... Pagination and Actions ... */}
                <div className="flex justify-between items-center">
                    <button onClick={handlePrev} disabled={page === 0} className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50">Previous</button>
                    <span>Page {page + 1} of {totalPages}</span>
                    <button onClick={handleNext} disabled={page >= totalPages - 1} className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50">Next</button>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSave} disabled={selectedRoles.length === 0} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Add Selected</button>
                </div>
            </div>
        </div>
    );
}