import { NavLink, Outlet, useParams } from "react-router-dom";

export default function GroupReceiptTabsPage() {
    const { warehouseId } = useParams();
    const base = `/warehouses/${warehouseId}/group-receipts`;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Group Receipts</h1>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <nav className="flex gap-2 border-b pb-3 mb-4">
                        <NavLink
                            to={base}
                            end
                            className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Pending
                        </NavLink>
                        <NavLink
                            to={`${base}/confirm`}
                            className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Confirm
                        </NavLink>
                        <NavLink
                            to={`${base}/complete`}
                            className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Complete
                        </NavLink>
                    </nav>

                    <div>
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}