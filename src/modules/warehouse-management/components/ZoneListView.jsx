import { FaWarehouse } from 'react-icons/fa';

// Hàm tiện ích để định dạng ngày giờ
const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        return new Date(isoString).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    } catch (error) { return 'Invalid Date'; }
};

const TableRowSkeleton = ({ columns }) => (
    <tr className="animate-pulse">
        {Array.from({ length: columns }).map((_, i) => (
            <td key={i} className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded"></div>
            </td>
        ))}
    </tr>
);

export default function ZoneListView({ zones, isLoading, page, size, onRowDoubleClick }) {
    const tableHeaders = ["STT", "Zone Name", "Zone Code", "Type", "Created At", "Updated At"];

    if (isLoading) {
        return (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {tableHeaders.map(header => (
                                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} columns={tableHeaders.length} />)}
                    </tbody>
                </table>
            </div>
        );
    }

    if (!zones || zones.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow">
                <FaWarehouse className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No zones found</h3>
                <p className="mt-1 text-sm text-gray-500">There are no zones to display for this warehouse.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {tableHeaders.map(header => (
                            <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {zones.map((zone, idx) => (
                        <tr key={zone.id} onDoubleClick={() => onRowDoubleClick(zone)} className="hover:bg-gray-50 cursor-pointer">
                            <td className="px-6 py-4 text-sm text-gray-700">{page * size + idx + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-left font-medium text-gray-900">{zone.zone_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-left text-gray-500">{zone.zone_code}</td>
                            <td className="px-6 py-4 text-left whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {zone.zone_type}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-left text-gray-500">{formatDateTime(zone.create_at)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-left text-gray-500">{formatDateTime(zone.update_at)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}