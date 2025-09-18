import { useState, useEffect } from 'react';
import Select from 'react-select';
import { FaSave, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const packageTypeOptions = [
    { value: 'SINGLE', label: 'Single' },
    { value: 'PACK', label: 'Pack' },
    { value: 'BOX', label: 'Box' },
    { value: 'CARTON', label: 'Carton' },
    { value: 'PALLET', label: 'Pallet' },
    { value: 'CRATE', label: 'Crate' },
    { value: 'BUNDLE', label: 'Bundle' },
];

const selectStyles = {
    control: (provided) => ({ ...provided, borderColor: '#d1d5db', borderRadius: '0.375rem', minHeight: '42px', boxShadow: 'none', '&:hover': { borderColor: '#a5b4fc' } }),
    option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#eef2ff' : 'white', color: state.isSelected ? 'white' : '#111827' }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 })
};

const initialFormState = {
    package_type: 'SINGLE', barcode: '', length: '', width: '', height: '', weight: '', quantity_in_parent: 1,
};

const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
};

const modalVariants = {
    hidden: { y: "-50px", scale: 0.95, opacity: 0 },
    visible: { y: 0, scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { y: "50px", scale: 0.95, opacity: 0, transition: { duration: 0.2 } },
};

export default function PackageModal({ isOpen, onClose, onSubmit, initialData }) {
    const [formData, setFormData] = useState(initialFormState);
    const isUpdateMode = !!initialData;

    useEffect(() => {
        if (isOpen) {
            if (isUpdateMode) {
                setFormData({
                    package_type: initialData.package_type || 'SINGLE', barcode: initialData.barcode || '', length: initialData.length || '',
                    width: initialData.width || '', height: initialData.height || '', weight: initialData.weight || '',
                    quantity_in_parent: initialData.quantity_in_parent || 1,
                });
            } else {
                setFormData(initialFormState);
            }
        }
    }, [initialData, isUpdateMode, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (option) => {
        setFormData(prev => ({ ...prev, package_type: option.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            length: parseFloat(formData.length) || 0, width: parseFloat(formData.width) || 0,
            height: parseFloat(formData.height) || 0, weight: parseFloat(formData.weight) || 0,
            quantity_in_parent: parseInt(formData.quantity_in_parent, 10) || 1,
        };
        onSubmit(payload);
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    key="backdrop"
                    className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex justify-center items-center z-50 p-4"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >
                    <motion.div
                        key="modal"
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 border-b">
                                <h2 className="text-2xl font-bold text-gray-800">{isUpdateMode ? 'Update Package' : 'Create New Package'}</h2>
                            </div>
                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Package Type <span className="text-red-500">*</span></label>
                                        <Select
                                            options={packageTypeOptions}
                                            value={packageTypeOptions.find(opt => opt.value === formData.package_type)}
                                            onChange={handleSelectChange}
                                            styles={selectStyles}
                                            menuPortalTarget={document.body}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                                        <input type="text" name="barcode" id="barcode" value={formData.barcode} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50/50">
                                        <input type="number" name="length" placeholder="Length" value={formData.length} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                                        <input type="number" name="width" placeholder="Width" value={formData.width} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                                        <input type="number" name="height" placeholder="Height" value={formData.height} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                                        <input type="number" name="weight" id="weight" value={formData.weight} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                                    </div>
                                    <div>
                                        <label htmlFor="quantity_in_parent" className="block text-sm font-medium text-gray-700 mb-1">Quantity in Parent</label>
                                        <input type="number" name="quantity_in_parent" id="quantity_in_parent" value={formData.quantity_in_parent} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                                <button type="button" onClick={onClose} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                                    <FaTimes /> Cancel
                                </button>
                                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
                                    <FaSave /> {isUpdateMode ? 'Save Changes' : 'Create Package'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}