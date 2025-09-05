import { useEffect, useState } from "react";
import userService from "@/modules/user/services/userService";
import { useNavigate } from "react-router-dom";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(6);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchUsers = async (pageNumber = 0) => {
        setLoading(true);
        try {
            const response = await userService.getList(pageNumber, size);
            setUsers(response.result.content);
            setTotalPages(response.result.totalPages);
            setPage(response?.result?.pageable?.pageNumber ?? 0);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handlePrev = () => {
        if (page > 0) fetchUsers(page - 1);
    };

    const handleNext = () => {
        if (page < totalPages - 1) fetchUsers(page + 1);
    };

    // Double click vào hàng để chuyển đến trang chi tiết
    const handleRowDoubleClick = (user) => {
        navigate(`/users/${user.user_id}`, {
            state: { username: user.username, is_active: user.is_active },
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 text-center"></h1>

            <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                                STT
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-48">
                                Username
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                                Active
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : users.length > 0 ? (
                            users.map((user, idx) => (
                                <tr
                                    key={user.user_id}
                                    className="hover:bg-blue-50 cursor-pointer transition"
                                    onDoubleClick={() => handleRowDoubleClick(user)}
                                >
                                    <td className="px-6 py-4 text-center text-sm text-gray-700 font-medium">
                                        {page * size + idx + 1}
                                    </td>
                                    <td className="px-6 py-4 text-center text-base text-gray-800 font-semibold">
                                        {user.username}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow
                                                ${user.is_active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {user.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-2">
                <button
                    onClick={handlePrev}
                    disabled={page === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="text-gray-700 font-medium">
                    Page {page + 1} of {totalPages}
                </span>
                <button
                    onClick={handleNext}
                    disabled={page >= totalPages - 1}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
            <div className="text-xs text-gray-400 text-center">* Double click a row to view user detail</div>
        </div>
    );
}