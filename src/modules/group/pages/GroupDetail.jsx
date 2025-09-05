import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import groupService from "@/modules/group/service/groupService";
import { FaUsers, FaShieldAlt, FaPlus, FaEdit, FaSave, FaTimes, FaUserSlash, FaTrash } from "react-icons/fa";
import AddRoleModal from "../components/AddRoleModal";
import AddUserModal from "../components/AddUserModal"; // Import modal mới

// Component Spinner để hiển thị khi loading
const Spinner = () => (
    <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
);

export default function GroupDetail() {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [activeTab, setActiveTab] = useState("roles");
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false); // State cho modal thêm user

    // State cho bảng roles
    const [roles, setRoles] = useState([]);
    const [rolesPage, setRolesPage] = useState(0);
    const [rolesTotalPages, setRolesTotalPages] = useState(1);
    const [rolesTotalElements, setRolesTotalElements] = useState(0);
    const [selectedRolesToDelete, setSelectedRolesToDelete] = useState([]);

    // State cho bảng users
    const [users, setUsers] = useState([]);
    const [usersPage, setUsersPage] = useState(0);
    const [usersTotalPages, setUsersTotalPages] = useState(1);
    const [usersTotalElements, setUsersTotalElements] = useState(0);
    const [selectedUsersToDelete, setSelectedUsersToDelete] = useState([]);

    const fetchGroupRoles = async (page = 0) => {
        try {
            const rolesRes = await groupService.getRoles(groupId, { page, size: 5 });
            setRoles(rolesRes.result?.content || []);
            setRolesPage(rolesRes.result?.pageNumber || 0);
            setRolesTotalPages(rolesRes.result?.totalPages || 1);
            setRolesTotalElements(rolesRes.result?.totalElements || 0);
        } catch (error) {
            console.error("Failed to fetch group roles:", error);
            setRoles([]);
        }
    };

    const fetchGroupUsers = async (page = 0) => {
        try {
            const usersRes = await groupService.getUsers(groupId, { page, size: 5 });
            setUsers(usersRes.result?.content || []);
            setUsersPage(usersRes.result?.pageNumber || 0);
            setUsersTotalPages(usersRes.result?.totalPages || 1);
            setUsersTotalElements(usersRes.result?.totalElements || 0);
        } catch (error) {
            console.error("Failed to fetch group users:", error);
            setUsers([]);
        }
    };

    useEffect(() => {
        const fetchGroupData = async () => {
            setLoading(true);
            try {
                const detailRes = await groupService.getDetail(groupId);
                setGroup(detailRes.result);
                setEditedName(detailRes.result.group_name);
                await Promise.all([fetchGroupRoles(0), fetchGroupUsers(0)]);
            } catch (error) {
                console.error("Failed to fetch group detail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGroupData();
    }, [groupId]);

    const handleSaveName = async () => {
        if (editedName.trim() === "" || editedName === group.group_name) {
            setIsEditing(false);
            return;
        }
        try {
            await groupService.update(groupId, { group_name: editedName });
            setGroup({ ...group, group_name: editedName });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update group name:", error);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedName(group.group_name);
    };

    const handleAddRoleSuccess = () => {
        setIsAddRoleModalOpen(false);
        fetchGroupRoles(0);
    };

    const handleAddUserSuccess = () => {
        setIsAddUserModalOpen(false);
        fetchGroupUsers(0); // Tải lại danh sách user từ trang đầu
    };

    const handleSelectRoleToDelete = (roleId) => {
        setSelectedRolesToDelete((prev) =>
            prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
        );
    };

    const handleDeleteRoles = async () => {
        if (selectedRolesToDelete.length === 0) return;
        try {
            // await groupService.removeRoles(groupId, { roles: selectedRolesToDelete });
            await groupService.removeRoles(groupId, { roles: selectedRolesToDelete });
            console.log("Deleting roles:", selectedRolesToDelete);
            setSelectedRolesToDelete([]);
            if (roles.length === selectedRolesToDelete.length && rolesPage > 0) {
                fetchGroupRoles(rolesPage - 1);
            } else {
                fetchGroupRoles(rolesPage);
            }
        } catch (error) {
            console.error("Failed to delete roles:", error);
        }
    };

    const handleSelectUserToDelete = (userId) => {
        setSelectedUsersToDelete((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleDeleteUsers = async () => {
        if (selectedUsersToDelete.length === 0) return;
        try {
            await groupService.removeUsers(groupId, { users: selectedUsersToDelete });
            setSelectedUsersToDelete([]);
            if (users.length === selectedUsersToDelete.length && usersPage > 0) {
                fetchGroupUsers(usersPage - 1);
            } else {
                fetchGroupUsers(usersPage);
            }
        } catch (error) {
            console.error("Failed to delete users:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Spinner />
            </div>
        );
    }

    return (
        <>
            <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <FaUsers className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="text-3xl font-bold text-gray-800 bg-transparent border-b-2 border-blue-500 focus:outline-none"
                                    autoFocus
                                />
                            ) : (
                                <h1 className="text-3xl font-bold text-gray-800">{group?.group_name}</h1>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <button onClick={handleSaveName} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                                    <FaSave />
                                </button>
                                <button onClick={handleCancelEdit} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                                    <FaTimes />
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                                <FaEdit />
                            </button>
                        )}
                    </div>
                </div>

                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab("roles")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                ${activeTab === 'roles'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Roles ({rolesTotalElements})
                        </button>
                        <button
                            onClick={() => setActiveTab("users")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                ${activeTab === 'users'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Users ({usersTotalElements})
                        </button>
                    </nav>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 min-h-[450px]">
                    {activeTab === "roles" ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-700">Assigned Roles</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleDeleteRoles}
                                        disabled={selectedRolesToDelete.length === 0}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                    <button
                                        onClick={() => setIsAddRoleModalOpen(true)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition text-sm"
                                    >
                                        <FaPlus /> Add Role
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="w-12 px-4 py-2"></th>
                                            <th className="w-1/3 px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Role Name</th>
                                            <th className="w-2/3 px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {roles.length > 0 ? (
                                            roles.map((role) => (
                                                <tr key={role.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            checked={selectedRolesToDelete.includes(role.id)}
                                                            onChange={() => handleSelectRoleToDelete(role.id)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-left text-gray-800">{role.role_name}</td>
                                                    <td className="px-4 py-3 text-left text-sm text-gray-600">{role.description || "--------"}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="px-6 py-8 text-center text-gray-500 italic">No roles assigned to this group.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {rolesTotalPages > 1 && (
                                <div className="flex justify-between items-center text-sm">
                                    <button onClick={() => fetchGroupRoles(rolesPage - 1)} disabled={rolesPage === 0} className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50">Previous</button>
                                    <span>Page {rolesPage + 1} of {rolesTotalPages}</span>
                                    <button onClick={() => fetchGroupRoles(rolesPage + 1)} disabled={rolesPage >= rolesTotalPages - 1} className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50">Next</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-700">Users in Group</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleDeleteUsers}
                                        disabled={selectedUsersToDelete.length === 0}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FaTrash /> Remove
                                    </button>
                                    <button
                                        onClick={() => setIsAddUserModalOpen(true)} // Mở modal thêm user
                                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition text-sm"
                                    >
                                        <FaPlus /> Add Member
                                    </button>
                                </div>
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
                                        {users.length > 0 ? (
                                            users.map((user) => (
                                                <tr key={user.user_id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            checked={selectedUsersToDelete.includes(user.user_id)}
                                                            onChange={() => handleSelectUserToDelete(user.user_id)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-left font-medium text-gray-800">{user.username}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                                            ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {user.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="px-6 py-8 text-center text-gray-500 italic">No users in this group.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {usersTotalPages > 1 && (
                                <div className="flex justify-between items-center text-sm">
                                    <button onClick={() => fetchGroupUsers(usersPage - 1)} disabled={usersPage === 0} className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50">Previous</button>
                                    <span>Page {usersPage + 1} of {usersTotalPages}</span>
                                    <button onClick={() => fetchGroupUsers(usersPage + 1)} disabled={usersPage >= usersTotalPages - 1} className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50">Next</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <AddRoleModal
                isOpen={isAddRoleModalOpen}
                onClose={() => setIsAddRoleModalOpen(false)}
                groupId={groupId}
                onSuccess={handleAddRoleSuccess}
            />

            {/* Render modal thêm user */}
            <AddUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                groupId={groupId}
                onSuccess={handleAddUserSuccess}
            />
        </>
    );
}
