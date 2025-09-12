import { useEffect, useState } from "react";
import userService from "@/modules/user/services/userService";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import CreateUserModal from "../components/CreateUserModal";
import Pagination from "@/components/common/Pagination"; // Import component Pagination

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(6); // Chuyển size thành state
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUsers = async (pageNumber = 0, pageSize = size) => {
        setLoading(true);
        try {
            const response = await userService.getList(pageNumber, pageSize);
            setUsers(response.result.content);
            setTotalPages(response.result.totalPages);
            setPage(response?.result?.pageNumber ?? 0);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    // useEffect sẽ chạy lại khi `size` thay đổi
    useEffect(() => {
        fetchUsers(0, size); // Khi size thay đổi, luôn fetch lại từ trang đầu
    }, [size]);

    const handlePageChange = (newPage) => {
        fetchUsers(newPage, size);
    };

    // Double click vào hàng để chuyển đến trang chi tiết
    const handleRowDoubleClick = (user) => {
        navigate(`/users/${user.user_id}`, {
            state: { username: user.username, is_active: user.is_active },
        });
    };

    // 3. Hàm xử lý khi tạo user thành công
    const handleCreateSuccess = () => {
        setIsModalOpen(false);
        fetchUsers(0, size);
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                    <button
                        onClick={() => setIsModalOpen(true)} // 4. Mở modal
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        <FaPlus /> Create User
                    </button>
                </div>

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

                {/* Pagination và PageSize Dropdown */}
                <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2 text-sm">
                        <label htmlFor="pageSize" className="text-gray-700 font-medium">Items per page:</label>
                        <select
                            id="pageSize"
                            value={size}
                            onChange={(e) => setSize(Number(e.target.value))}
                            className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value={6}>6</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />

                    {/* Nút Previous/Next cũ có thể giữ lại hoặc xóa đi tùy ý */}
                    <div></div>
                </div>
            </div>

            {/* 5. Render modal */}
            <CreateUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />
        </>
    );
}