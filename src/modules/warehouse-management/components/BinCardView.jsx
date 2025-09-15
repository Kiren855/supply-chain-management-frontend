import React from 'react';
import { motion } from 'framer-motion';
import { FaBox, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaTag, FaCalendarPlus, FaCalendarCheck } from 'react-icons/fa';

const colorPalette = [
    { bg: 'bg-cyan-500', text: 'text-cyan-800', ring: 'ring-cyan-500' },
    { bg: 'bg-sky-500', text: 'text-sky-800', ring: 'ring-sky-500' },
    { bg: 'bg-emerald-500', text: 'text-emerald-800', ring: 'ring-emerald-500' },
    { bg: 'bg-lime-500', text: 'text-lime-800', ring: 'ring-lime-500' },
    { bg: 'bg-orange-500', text: 'text-orange-800', ring: 'ring-orange-500' },
];

const getAccentColor = (id) => colorPalette[id % colorPalette.length];

const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        return new Date(isoString).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
        });
    } catch (error) { return 'Invalid Date'; }
};

// Component Badge cho Status của Bin (Đã cập nhật logic)
const BinStatusBadge = ({ bin }) => {
    let statusKey = 'UNAVAILABLE'; // Mặc định là "Không khả dụng" nếu bin_status không phải 'ACTIVE'

    // Bước 1: Kiểm tra Trạng thái Hệ thống
    if (bin.bin_status === 'ACTIVE') {
        // Bước 2: Suy ra Trạng thái Tồn kho
        // Xử lý trường hợp max_volume là 0 hoặc null để tránh lỗi chia cho 0
        if (!bin.max_volume || bin.max_volume <= 0) {
            statusKey = 'EMPTY';
        } else {
            const usage = bin.current_volume / bin.max_volume;
            if (usage <= 0) {
                statusKey = 'EMPTY';
            } else if (usage >= 1) {
                statusKey = 'FULL';
            } else {
                statusKey = 'PARTIAL';
            }
        }
    }

    const statusInfo = {
        EMPTY: { text: 'Empty', icon: <FaBox />, styles: 'bg-green-100 text-green-800' },
        PARTIAL: { text: 'Partial', icon: <FaExclamationTriangle />, styles: 'bg-yellow-100 text-yellow-800' },
        FULL: { text: 'Full', icon: <FaCheckCircle />, styles: 'bg-blue-100 text-blue-800' },
        UNAVAILABLE: { text: 'Unavailable', icon: <FaTimesCircle />, styles: 'bg-red-100 text-red-800' },
    };
    const info = statusInfo[statusKey] || { text: 'Unknown', styles: 'bg-gray-100 text-gray-800' };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full ${info.styles}`}>
            {info.icon}
            {info.text}
        </span>
    );
};

// Cập nhật Skeleton để khớp với giao diện mới
const CardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-md border animate-pulse overflow-hidden">
        <div className="h-24 bg-gray-200"></div>
        <div className="p-5 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="border-t pt-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>
    </div>
);

const BinCardView = ({ bins, isLoading, onRowDoubleClick }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
        );
    }

    if (!bins || bins.length === 0) {
        return <div className="p-8 text-center text-gray-500 bg-white rounded-2xl shadow-lg">No bins found in this zone.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bins.map((bin, index) => {
                const accent = getAccentColor(bin.id);
                return (
                    <motion.div
                        key={bin.id}
                        onDoubleClick={() => onRowDoubleClick(bin)}
                        className={`bg-white rounded-xl shadow-lg border border-gray-200 cursor-pointer overflow-hidden
                                    hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group
                                    hover:ring-2 hover:ring-offset-2 ${accent.ring}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div className={`relative p-5 ${accent.bg} text-white`}>
                            <FaBox className="absolute right-2 top-1/2 -translate-y-1/2 text-white/10 text-7xl" />
                            <div className="relative z-10">
                                {/* --- Sửa ở đây: Đảo vị trí và thay đổi style --- */}
                                <h3 className="text-xl font-bold truncate" title={bin.bin_name}>{bin.bin_name}</h3>
                                <p className="text-sm font-mono text-white/80 truncate" title={bin.bin_code}>{bin.bin_code}</p>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-center text-sm text-gray-700 mb-5">
                                <div className="flex items-center gap-2">
                                    <FaTag className={`${accent.text} flex-shrink-0`} />
                                    <span>{bin.bin_type}</span>
                                </div>
                                <BinStatusBadge bin={bin} />
                            </div>

                            {/* --- Sửa ở đây: Hiển thị cả ngày tạo và ngày cập nhật --- */}
                            <div className="border-t border-gray-100 pt-4 flex justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <FaCalendarPlus className="text-green-500" />
                                    <span>{formatDateTime(bin.create_at)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <FaCalendarCheck className="text-blue-500" />
                                    <span>{formatDateTime(bin.update_at)}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default BinCardView;