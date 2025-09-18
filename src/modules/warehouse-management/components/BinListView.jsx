import React from 'react';
import { motion } from 'framer-motion';
import { FaBox, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';

// --- Tiện ích định dạng ngày giờ ---
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
    let statusKey = 'UNAVAILABLE';

    if (bin.bin_status === 'ACTIVE') {
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

const BinListView = ({ bins, isLoading, page, size, onRowDoubleClick }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                {/* --- Sửa ở đây: Thêm 'table-fixed' và định nghĩa lại độ rộng cột --- */}
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bin Code</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bin Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Type</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">Dimensions (cm)</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Weight (kg)</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-44">Updated At</th>
                        </tr>
                    </thead>
                    <motion.tbody
                        className="bg-white divide-y divide-gray-200"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {isLoading ? (
                            Array.from({ length: size }).map((_, index) => (
                                <tr key={index} className="animate-pulse">
                                    {/* Giảm số cột skeleton cho khớp */}
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                    <td className="px-4 py-4"><div className="h-6 bg-gray-200 rounded-full mx-auto"></div></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                </tr>
                            ))
                        ) : (
                            bins.map((bin, index) => (
                                <motion.tr
                                    key={bin.id}
                                    variants={itemVariants}
                                    onDoubleClick={() => onRowDoubleClick(bin)}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    {/* --- Sửa ở đây: Dùng lại truncate và overflow-hidden --- */}
                                    <td className="px-4 py-4 text-sm text-gray-500 text-right">{page * size + index + 1}</td>
                                    <td className="px-4 py-4 text-left text-sm text-gray-800 font-medium truncate overflow-hidden" title={bin.bin_code}>{bin.bin_code}</td>
                                    <td className="px-4 py-4 text-left text-sm text-gray-600 truncate overflow-hidden" title={bin.bin_name}>{bin.bin_name}</td>
                                    <td className="px-4 py-4 text-left text-sm text-gray-600">{bin.bin_type}</td>
                                    <td className="px-4 py-4 text-sm text-gray-600 font-mono text-right">{`${Number(bin.length)}x${Number(bin.width)}x${Number(bin.height)}`}</td>
                                    <td className="px-4 py-4 text-sm text-gray-600 text-right">{`${Number(bin.current_weight)} / ${Number(bin.max_weight)}`}</td>
                                    <td className="px-4 py-4 text-center">
                                        <BinStatusBadge bin={bin} />
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-600">{formatDateTime(bin.update_at)}</td>
                                </motion.tr>
                            ))
                        )}
                    </motion.tbody>
                </table>
            </div>
        </div>
    );
};

export default BinListView;