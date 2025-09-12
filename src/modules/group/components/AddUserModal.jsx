import { useEffect, useState } from "react";
import userService from "@/modules/user/services/userService";
import groupService from "@/modules/group/service/groupService";
import { FaTimes } from "react-icons/fa";

export default function AddUserModal({ isOpen, onClose, groupId, onSuccess }) {
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchAllUsers = async (pageNumber = 0) => {
        setLoading(true);
        try {
            const response = await userService.getList(pageNumber, size);
            setAllUsers(response.result.content);
            setTotalPages(response.result.totalPages);
            setPage(response.result.pageNumber);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchAllUsers(0);
            setSelectedUsers([]);
        }
    }, [isOpen]);

    const handleSelectUser = (userId) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSave = async () => {
        if (selectedUsers.length === 0) return;
        try {
            await groupService.addUsers(groupId, { users: selectedUsers });
            onSuccess();
        } catch (error) {
            console.error("Failed to add users to group:", error);
        }
    };

    const handlePrev = () => {
        if (page > 0) fetchAllUsers(page - 1);
    };

    const handleNext = () => {
        if (page < totalPages - 1) fetchAllUsers(page + 1);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.25)] flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h2 className="text-2xl font-bold text-gray-800">Add Members</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="w-12 px-4 py-2"></th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Username</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="3" className="text-center py-4">Loading...</td></tr>
                            ) : (
                                allUsers.map((user) => (
                                    <tr
                                        key={user.user_id}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleSelectUser(user.user_id)}
                                    >
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                                                checked={selectedUsers.includes(user.user_id)}
                                                readOnly
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{user.username}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center">
                    <button onClick={handlePrev} disabled={page === 0} className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50">Previous</button>
                    <span>Page {page + 1} of {totalPages}</span>
                    <button onClick={handleNext} disabled={page >= totalPages - 1} className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50">Next</button>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSave} disabled={selectedUsers.length === 0} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Add Selected</button>
                </div>
            </div>
        </div>
    );
}