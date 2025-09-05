import { useEffect, useState } from "react";
import groupService from "@/modules/group/service/groupService";
import { useNavigate } from "react-router-dom";

export default function GroupsPage() {
    const [groups, setGroups] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchGroups = async (pageNumber = 0) => {
        setLoading(true);
        try {
            const response = await groupService.getList(pageNumber, size);
            setGroups(response.result.content);
            setTotalPages(response.result.totalPages);
            setPage(response?.result?.pageable?.pageNumber ?? 0);
        } catch (error) {
            console.error("Failed to fetch groups:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handlePrev = () => {
        if (page > 0) fetchGroups(page - 1);
    };

    const handleNext = () => {
        if (page < totalPages - 1) fetchGroups(page + 1);
    };

    // Double click vào hàng để chuyển đến trang chi tiết group
    const handleRowDoubleClick = (group) => {
        navigate(`/groups/${group.id}`, {
            state: { group_name: group.group_name },
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
                                Group Name
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-48">
                                Created By
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
                        ) : groups.length > 0 ? (
                            groups.map((group, idx) => (
                                <tr
                                    key={group.id}
                                    className="hover:bg-blue-50 cursor-pointer transition"
                                    onDoubleClick={() => handleRowDoubleClick(group)}
                                >
                                    <td className="px-6 py-4 text-center text-sm text-gray-700 font-medium">
                                        {page * size + idx + 1}
                                    </td>
                                    <td className="px-6 py-4 text-center text-base text-gray-800 font-semibold">
                                        {group.group_name}
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm text-gray-700">
                                        {group.username_created}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                    No groups found.
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
        </div>
    );
}