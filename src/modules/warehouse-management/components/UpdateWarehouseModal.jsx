import { useState, useEffect, useMemo } from 'react'; // Thêm useMemo
import { motion, AnimatePresence } from 'framer-motion';
import { FaWarehouse, FaInfoCircle } from 'react-icons/fa';
import { useToast } from '@/contexts/ToastContext';
import warehouseService from '../service/warehouseService';
import LocationPicker from '@/components/common/LocationPicker';

export default function UpdateWarehouseModal({ isOpen, onClose, warehouseData, onWarehouseUpdated }) {
    const [name, setName] = useState('');
    const [locationData, setLocationData] = useState({
        latitude: null,
        longitude: null,
        address: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { addToast } = useToast();

    // Sử dụng useMemo để ổn định prop initialData
    const initialLocationData = useMemo(() => {
        if (!warehouseData) return null;
        return {
            latitude: warehouseData.latitude,
            longitude: warehouseData.longitude,
            address: warehouseData.location
        };
    }, [warehouseData]);

    // Điền dữ liệu vào form khi modal được mở hoặc warehouseData thay đổi
    useEffect(() => {
        if (warehouseData) {
            setName(warehouseData.warehouse_name || '');
            setLocationData({
                latitude: warehouseData.latitude,
                longitude: warehouseData.longitude,
                address: warehouseData.location,
            });
        }
    }, [warehouseData, isOpen]);

    const handleLocationChange = (newLocation) => {
        setLocationData(newLocation);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !locationData.latitude) {
            setError('Please provide a warehouse name and select a location on the map.');
            return;
        }
        setIsSubmitting(true);
        setError('');

        try {
            await warehouseService.updateWarehouse(warehouseData.id, {
                warehouse_name: name,
                location: locationData.address,
                latitude: locationData.latitude,
                longitude: locationData.longitude,
            });
            addToast('Warehouse updated successfully!', 'success');
            onWarehouseUpdated();
            onClose();
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to update warehouse.';
            setError(message);
            addToast(message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.25)] p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Warehouse</h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="update-warehouse-name" className="block text-sm font-medium text-gray-700">Warehouse Name</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <FaWarehouse className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="update-warehouse-name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Truyền vào initialLocationData đã được ổn định */}
                                <LocationPicker
                                    onLocationChange={handleLocationChange}
                                    initialData={initialLocationData}
                                />

                                {error && <p className="text-sm text-red-600 flex items-center gap-2"><FaInfoCircle /> {error}</p>}
                                <div className="pt-4 flex justify-end gap-3">
                                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                                        {isSubmitting ? 'Updating...' : 'Update Warehouse'}
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