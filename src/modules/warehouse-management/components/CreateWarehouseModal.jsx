import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWarehouse, FaMapMarkerAlt } from 'react-icons/fa';

export default function CreateWarehouseModal({ isOpen, onClose, onSubmit }) {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('temp location'); // Giá trị mặc định như bạn yêu cầu
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form khi modal được mở
    useEffect(() => {
        if (isOpen) {
            setName('');
            setLocation('temp location');
            setError('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !location.trim()) {
            setError('Warehouse Name and Location are required.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        // Gọi hàm onSubmit được truyền từ component cha
        await onSubmit({ warehouse_name: name, location });
        setIsSubmitting(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-[rgba(0,0,0,0.25)] flex justify-center items-center z-50"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-md"
                        onClick={(e) => e.stopPropagation()} // Ngăn modal đóng khi click vào bên trong
                    >
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Warehouse</h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="warehouse-name" className="block text-sm font-medium text-gray-700">Warehouse Name</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <FaWarehouse className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="warehouse-name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5"
                                            placeholder="e.g., Main Warehouse"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="location"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5"
                                            placeholder="e.g., District 1, HCMC"
                                            required
                                        />
                                    </div>
                                </div>
                                {error && <p className="text-sm text-red-600">{error}</p>}
                                <div className="pt-4 flex justify-end gap-3">
                                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                                        {isSubmitting ? 'Creating...' : 'Create Warehouse'}
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