import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/common/Button';
import { FaTimes } from 'react-icons/fa';

const UpdateZoneModal = ({ isOpen, onClose, onSubmit, zoneData }) => {
    const [formData, setFormData] = useState({ zone_name: '', zone_type: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cập nhật form data khi zoneData prop thay đổi (khi modal được mở)
    useEffect(() => {
        if (zoneData) {
            setFormData({
                zone_name: zoneData.zone_name || '',
                zone_type: zoneData.zone_type || '',
            });
        }
    }, [zoneData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            onClose(); // Đóng modal nếu submit thành công
        } catch (error) {
            // Lỗi đã được xử lý và hiển thị toast ở component cha
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.25)] p-4">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="bg-white rounded-lg shadow-2xl w-full max-w-lg"
                >
                    <div className="flex justify-between items-center p-5 border-b">
                        <h2 className="text-xl font-bold text-gray-800">Update Zone</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                            <FaTimes />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 space-y-6">
                            <div>
                                <label htmlFor="zone_name" className="block text-sm font-medium text-gray-700 mb-1">Zone Name</label>
                                <input
                                    id="zone_name"
                                    name="zone_name"
                                    type="text"
                                    required
                                    value={formData.zone_name}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="zone_type" className="block text-sm font-medium text-gray-700 mb-1">Zone Type</label>
                                <select
                                    id="zone_type"
                                    name="zone_type"
                                    required
                                    value={formData.zone_type}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="RECEIVING">Receiving</option>
                                    <option value="STORAGE">Storage</option>
                                    <option value="PICKING">Picking</option>
                                    <option value="PACKING">Packing</option>
                                    <option value="SHIPPING">Shipping</option>
                                    <option value="RETURN">Return</option>
                                    <option value="QC">QC</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end items-center p-5 border-t gap-4">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button type="submit" variant="primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Updating...' : 'Update Zone'}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UpdateZoneModal;