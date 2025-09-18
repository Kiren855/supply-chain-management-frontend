import React from 'react';
import { motion } from 'framer-motion';
import { FaWarehouse, FaMapMarkerAlt } from 'react-icons/fa';

// Component Badge cho Status
const StatusBadge = ({ status }) => {
    const statusStyles = {
        ACTIVE: 'bg-green-100 text-green-800',
        INACTIVE: 'bg-red-100 text-red-800',
    };
    const text = status === 'ACTIVE' ? 'Active' : 'Inactive';
    return (
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
            {text}
        </span>
    );
};

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
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[5%]">#</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[25%]">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[40%]">Location</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                        Array.from({ length: size }).map((_, index) => (
                            <tr key={index} className="animate-pulse">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="h-4 bg-gray-200 rounded-full w-10"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="h-4 bg-gray-200 rounded-full w-24"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="h-4 bg-gray-200 rounded-full w-32"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="h-4 bg-gray-200 rounded-full w-48"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="h-4 bg-gray-200 rounded-full w-20 mx-auto"></div>
                                </td>
                            </tr>
                        ))
                    ) : warehouses.length > 0 ? (
                        warehouses.map((warehouse, idx) => (
                            <tr key={warehouse.id} className="hover:bg-blue-50 cursor-pointer transition" onDoubleClick={() => onRowDoubleClick(warehouse)}>
                                <td className="px-6 py-4 text-sm text-gray-700">{page * size + idx + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-600">{warehouse.warehouse_code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-800 font-medium">{warehouse.warehouse_name}</td>
                                <td className="px-6 py-4 text-left text-sm text-gray-600">{warehouse.location}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <StatusBadge status={warehouse.status} />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" className="p-8 text-center text-gray-500">No warehouses found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}