import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWarehouse, FaLayerGroup, FaInfoCircle } from 'react-icons/fa';

const zoneTypes = [
    "RECEIVING",
    "STORAGE",
    "PICKING",
    "PACKING",
    "SHIPPING",
    "RETURN",
    "QC"
];

export default function CreateZoneModal({ isOpen, onClose, onSubmit }) {
    const [zoneName, setZoneName] = useState('');
    const [zoneType, setZoneType] = useState('STORAGE'); // Mặc định là STORAGE
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!zoneName.trim()) {
            setError('Zone name is required.');
            return;
        }
        setIsSubmitting(true);
        setError('');

        try {
            // Gọi hàm onSubmit được truyền từ component cha
            await onSubmit({
                zone_name: zoneName,
                zone_type: zoneType,
            });
            // Reset form và đóng modal sau khi thành công (cha sẽ xử lý)
            setZoneName('');
            setZoneType('STORAGE');
        } catch (err) {
            // Lỗi sẽ được xử lý ở component cha và hiển thị qua toast
            // Nhưng chúng ta vẫn có thể set lỗi cục bộ nếu cần
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        // Reset state khi đóng modal
        setZoneName('');
        setZoneType('STORAGE');
        setError('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.25)] p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Zone</h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="zone-name" className="block text-sm font-medium text-gray-700">Zone Name</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <FaWarehouse className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="zone-name"
                                            value={zoneName}
                                            onChange={(e) => setZoneName(e.target.value)}
                                            className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5"
                                            placeholder="e.g., Aisle 1, Section A"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="zone-type-select" className="block text-sm font-medium text-gray-700">Zone Type</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <FaLayerGroup className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            id="zone-type-select"
                                            value={zoneType}
                                            onChange={(e) => setZoneType(e.target.value)}
                                            className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5"
                                        >
                                            {zoneTypes.map(type => (
                                                <option key={type} value={type}>
                                                    {type.charAt(0) + type.slice(1).toLowerCase()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {error && <p className="text-sm text-red-600 flex items-center gap-2"><FaInfoCircle /> {error}</p>}
                                <div className="pt-4 flex justify-end gap-3">
                                    <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                                        {isSubmitting ? 'Creating...' : 'Create Zone'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}