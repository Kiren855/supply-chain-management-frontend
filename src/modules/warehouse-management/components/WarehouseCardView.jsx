import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaCalendarPlus, FaCalendarCheck, FaWarehouse } from 'react-icons/fa';

// 1. Bảng màu hiện đại và hàm tạo màu nhấn
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


// 1. Cập nhật hàm định dạng để trả về một chuỗi duy nhất
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

// 2. Skeleton loader được cập nhật để khớp với layout mới
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
                        className={`bg-white rounded-xl shadow-lg border border-gray-200 cursor-pointer overflow-hidden
                                    hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group
                                    hover:ring-2 hover:ring-offset-2 ${accent.ring}`}
                        onDoubleClick={() => onRowDoubleClick(wh)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        {/* 3. Header với màu nhấn và icon nền */}
                        <div className={`relative p-5 ${accent.bg} text-white`}>
                            <FaWarehouse className="absolute right-2 top-1/2 -translate-y-1/2 text-white/10 text-7xl" />
                            <h3 className="text-xl font-bold truncate relative z-10">{wh.warehouse_name}</h3>
                            <p className="text-sm font-mono text-white/80 relative z-10">{wh.warehouse_code}</p>
                        </div>

                        {/* 4. Phần thân thẻ với thông tin chi tiết */}
                        <div className="p-5">
                            <div className="flex items-start gap-3 text-sm text-gray-700 mb-5">
                                <FaMapMarkerAlt className={`mt-1 ${accent.text} flex-shrink-0`} />
                                <span>{wh.location}</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between text-xs text-gray-500">
                                {/* 2. Hiển thị ngày và giờ trên cùng 1 dòng */}
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