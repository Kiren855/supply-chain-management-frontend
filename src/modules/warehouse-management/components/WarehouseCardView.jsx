import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaCalendarPlus, FaCalendarCheck, FaWarehouse } from 'react-icons/fa';

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

// Bảng màu hiện đại và hàm tạo màu nhấn
const colorPalette = [
    { bg: 'bg-blue-500', text: 'text-blue-800', ring: 'ring-blue-500' },
    { bg: 'bg-green-500', text: 'text-green-800', ring: 'ring-green-500' },
    { bg: 'bg-purple-500', text: 'text-purple-800', ring: 'ring-purple-500' },
    { bg: 'bg-red-500', text: 'text-red-800', ring: 'ring-red-500' },
    { bg: 'bg-yellow-500', text: 'text-yellow-800', ring: 'ring-yellow-500' },
    { bg: 'bg-indigo-500', text: 'text-indigo-800', ring: 'ring-indigo-500' },
    { bg: 'bg-pink-500', text: 'text-pink-800', ring: 'ring-pink-500' },
    { bg: 'bg-teal-500', text: 'text-teal-800', ring: 'ring-teal-500' },
];

const getAccentColor = (id) => {
    return colorPalette[id % colorPalette.length];
};

// Hàm định dạng ngày giờ
const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        return new Date(isoString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (error) {
        return 'Invalid Date';
    }
};

// Skeleton loader khớp với layout mới
const CardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-md border animate-pulse overflow-hidden">
        <div className="h-24 bg-gray-200"></div>
        <div className="p-5 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
        </div>
    </div>
);

export default function WarehouseCardView({ warehouses, isLoading, onRowDoubleClick }) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
        );
    }

    if (!warehouses || warehouses.length === 0) {
        return <div className="p-8 text-center text-gray-500 bg-white rounded-2xl shadow-lg">No warehouses found.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {warehouses.map((wh, index) => {
                const accent = getAccentColor(wh.id);

                return (
                    <motion.div
                        key={wh.id}
                        className={`relative bg-white rounded-xl shadow-lg border border-gray-200 cursor-pointer overflow-hidden
                                    hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group
                                    hover:ring-2 hover:ring-offset-2 ${accent.ring}`}
                        onDoubleClick={() => onRowDoubleClick(wh)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        {/* Status Badge được thêm vào đây */}
                        <div className="absolute top-3 right-3 z-20">
                            <StatusBadge status={wh.status} />
                        </div>

                        {/* Header với màu nhấn và icon nền */}
                        <div className={`relative p-5 ${accent.bg} text-white`}>
                            {/* Di chuyển icon sang trái bằng cách đổi 'right-2' thành 'left-2' */}
                            <FaWarehouse className="absolute left-2 top-1/2 -translate-y-1/2 text-white/10 text-7xl" />

                            {/* Thêm padding-left (pl-20) để tạo không gian cho icon */}
                            <div className="relative z-10 pl-20">
                                <h3 className="text-xl font-bold truncate">{wh.warehouse_name}</h3>
                                <p className="text-sm font-mono text-white/80">{wh.warehouse_code}</p>
                            </div>
                        </div>

                        {/* Phần thân thẻ với thông tin chi tiết */}
                        <div className="p-5">
                            <div className="flex items-start gap-3 text-sm text-gray-700 mb-5">
                                <FaMapMarkerAlt className={`mt-1 ${accent.text} flex-shrink-0`} />
                                <span>{wh.location}</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <FaCalendarPlus className="text-green-500" />
                                    <span>{formatDateTime(wh.create_at)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <FaCalendarCheck className="text-blue-500" />
                                    <span>{formatDateTime(wh.update_at)}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}