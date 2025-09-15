import { motion } from 'framer-motion';
import { FaLayerGroup, FaCalendarPlus, FaCalendarCheck, FaTag } from 'react-icons/fa';

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

export default function ZoneCardView({ zones, isLoading, onRowDoubleClick }) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
        );
    }

    if (!zones || zones.length === 0) {
        return <div className="p-8 text-center text-gray-500 bg-white rounded-2xl shadow-lg">No zones found.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zones.map((zone, index) => {
                const accent = getAccentColor(zone.id);
                return (
                    <motion.div
                        key={zone.id}
                        className={`bg-white rounded-xl shadow-lg border border-gray-200 cursor-pointer overflow-hidden
                                    hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group
                                    hover:ring-2 hover:ring-offset-2 ${accent.ring}`}
                        onDoubleClick={() => onRowDoubleClick(zone)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div className={`relative p-5 ${accent.bg} text-white`}>
                            <FaLayerGroup className="absolute right-2 top-1/2 -translate-y-1/2 text-white/10 text-7xl" />
                            <h3 className="text-xl font-bold truncate relative z-10">{zone.zone_name}</h3>
                            <p className="text-sm font-mono text-white/80 relative z-10">{zone.zone_code}</p>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center gap-3 text-sm text-gray-700 mb-5">
                                <FaTag className={`mt-1 ${accent.text} flex-shrink-0`} />
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {zone.zone_type}
                                </span>
                            </div>
                            <div className="border-t pt-4 flex justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <FaCalendarPlus className="text-green-500" />
                                    <span>{formatDateTime(zone.create_at)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <FaCalendarCheck className="text-blue-500" />
                                    <span>{formatDateTime(zone.update_at)}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}