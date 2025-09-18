import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBox, FaTag, FaRulerCombined, FaWeightHanging, FaInfoCircle } from 'react-icons/fa';

const binTypes = ["SHELF", "PALLET", "RACK", "FLOW_RACK", "CARTON_FLOW"];

// --- Validation Constants ---
const MAX_DIMENSION_LENGTH = 120; // cm
const MAX_DIMENSION_WIDTH = 100; // cm
const MAX_DIMENSION_HEIGHT = 200; // cm
const MAX_WEIGHT_KG = 2000; // kg

const initialFormState = {
    bin_name: '',
    bin_type: 'SHELF',
    length: '',
    width: '',
    height: '',
    max_weight: '',
};

export default function CreateBinModal({ isOpen, onClose, onSubmit }) {
    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({}); // Thay đổi để xử lý nhiều lỗi

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Xóa lỗi khi người dùng bắt đầu nhập lại
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const { bin_name, length, width, height, max_weight } = formData;

        if (!bin_name.trim()) newErrors.bin_name = 'Bin name is required.';

        // Validate dimensions
        const validateDimension = (value, fieldName, max) => {
            if (!value) newErrors[fieldName] = `${fieldName} is required.`;
            else if (isNaN(value) || Number(value) <= 0) newErrors[fieldName] = `${fieldName} must be a positive number.`;
            else if (Number(value) > max) newErrors[fieldName] = `${fieldName} cannot exceed ${max} cm.`;
        };

        validateDimension(length, 'length', MAX_DIMENSION_LENGTH);
        validateDimension(width, 'width', MAX_DIMENSION_WIDTH);
        validateDimension(height, 'height', MAX_DIMENSION_HEIGHT);

        // Validate max weight
        if (!max_weight) newErrors.max_weight = 'Max weight is required.';
        else if (isNaN(max_weight) || Number(max_weight) <= 0) newErrors.max_weight = 'Max weight must be a positive number.';
        else if (Number(max_weight) > MAX_WEIGHT_KG) newErrors.max_weight = `Max weight cannot exceed ${MAX_WEIGHT_KG} kg.`;

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            await onSubmit(formData);
            setFormData(initialFormState);
        } catch (err) {
            setErrors({ api: err.message || 'An unexpected error occurred.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData(initialFormState);
        setErrors({});
        onClose();
    };

    const getInputClassName = (fieldName) =>
        `w-full rounded-md p-2.5 ${errors[fieldName] ? 'border-red-500 ring-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500`;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.25)] p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Bin</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Bin Name */}
                                    <div>
                                        <label htmlFor="bin_name" className="block text-sm font-medium text-gray-700">Bin Name</label>
                                        <div className="mt-1 relative">
                                            <FaBox className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                                            <input type="text" name="bin_name" id="bin_name" value={formData.bin_name} onChange={handleChange} className={`${getInputClassName('bin_name')} pl-10`} placeholder="e.g., A-01-S01" />
                                        </div>
                                        {errors.bin_name && <p className="text-xs text-red-600 mt-1">{errors.bin_name}</p>}
                                    </div>
                                    {/* Bin Type */}
                                    <div>
                                        <label htmlFor="bin_type" className="block text-sm font-medium text-gray-700">Bin Type</label>
                                        <div className="mt-1 relative">
                                            <FaTag className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                                            <select name="bin_type" id="bin_type" value={formData.bin_type} onChange={handleChange} className={`${getInputClassName('bin_type')} pl-10`}>
                                                {binTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Dimensions */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Dimensions (cm)</label>
                                    <div className="mt-1 grid grid-cols-3 gap-3">
                                        <div>
                                            <input type="number" name="length" value={formData.length} onChange={handleChange} className={getInputClassName('length')} placeholder="Length" step="0.01" />
                                            {errors.length && <p className="text-xs text-red-600 mt-1">{errors.length}</p>}
                                        </div>
                                        <div>
                                            <input type="number" name="width" value={formData.width} onChange={handleChange} className={getInputClassName('width')} placeholder="Width" step="0.01" />
                                            {errors.width && <p className="text-xs text-red-600 mt-1">{errors.width}</p>}
                                        </div>
                                        <div>
                                            <input type="number" name="height" value={formData.height} onChange={handleChange} className={getInputClassName('height')} placeholder="Height" step="0.01" />
                                            {errors.height && <p className="text-xs text-red-600 mt-1">{errors.height}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Max Weight */}
                                <div>
                                    <label htmlFor="max_weight" className="block text-sm font-medium text-gray-700">Max Weight (kg)</label>
                                    <div className="mt-1 relative">
                                        <FaWeightHanging className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                                        <input type="number" name="max_weight" id="max_weight" value={formData.max_weight} onChange={handleChange} className={`${getInputClassName('max_weight')} pl-10`} placeholder="e.g., 1000" step="0.1" />
                                    </div>
                                    {errors.max_weight && <p className="text-xs text-red-600 mt-1">{errors.max_weight}</p>}
                                </div>

                                {errors.api && <p className="text-sm text-red-600 flex items-center gap-2"><FaInfoCircle /> {errors.api}</p>}
                                <div className="pt-4 flex justify-end gap-3">
                                    <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                                        {isSubmitting ? 'Creating...' : 'Create Bin'}
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