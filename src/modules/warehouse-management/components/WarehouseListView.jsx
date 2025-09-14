// Hàm tiện ích để định dạng ngày giờ
const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        return new Date(isoString).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
        });
    } catch (error) { return 'Invalid Date'; }
};

export default function WarehouseListView({ warehouses, isLoading, page, size, onRowDoubleClick }) {
    return (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">STT</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created At</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Updated At</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {isLoading ? (
                        <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading warehouses...</td></tr>
                    ) : warehouses.length > 0 ? (
                        warehouses.map((wh, idx) => (
                            <tr key={wh.id} className="hover:bg-blue-50 cursor-pointer transition" onDoubleClick={() => onRowDoubleClick(wh)}>
                                <td className="px-6 py-4 text-sm text-gray-700">{page * size + idx + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-left font-medium text-gray-900">{wh.warehouse_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-left text-gray-500 font-mono">{wh.warehouse_code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-left text-gray-500">{wh.location}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-left text-gray-500">{formatDateTime(wh.create_at)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-left text-gray-500">{formatDateTime(wh.update_at)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="6" className="p-8 text-center text-gray-500">No warehouses found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}