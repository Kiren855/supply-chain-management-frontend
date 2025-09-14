import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import productService from "@/modules/product-catalog/service/productService";
import { useToast } from "@/contexts/ToastContext";
import { FaSave, FaTimes, FaInfoCircle, FaTags, FaAlignLeft } from "react-icons/fa";

// Danh sách đơn vị được định nghĩa sẵn
const unitOptions = [
    { value: "pcs", label: "Piece" }, { value: "box", label: "Box" }, { value: "pack", label: "Pack" },
    { value: "bottle", label: "Bottle" }, { value: "can", label: "Can" }, { value: "jar", label: "Jar" },
    { value: "tube", label: "Tube" }, { value: "bag", label: "Bag" }, { value: "sachet", label: "Sachet" },
    { value: "tray", label: "Tray" }, { value: "bundle", label: "Bundle" }, { value: "dozen", label: "Dozen" },
    { value: "roll", label: "Roll" }, { value: "drum", label: "Drum" }, { value: "barrel", label: "Barrel" },
    { value: "kg", label: "Kilogram" }, { value: "g", label: "Gram" }, { value: "l", label: "Liter" },
    { value: "ml", label: "Milliliter" }, { value: "m", label: "Meter" }, { value: "cm", label: "Centimeter" },
    { value: "m3", label: "Cubic meter" }, { value: "carton", label: "Carton" }, { value: "pallet", label: "Pallet" },
    { value: "container", label: "Container" }
];

// Custom styles cho react-select để hợp với Tailwind
const selectStyles = {
    control: (provided) => ({
        ...provided,
        borderColor: '#d1d5db',
        borderRadius: '0.375rem',
        minHeight: '42px',
        boxShadow: 'none',
        '&:hover': { borderColor: '#a5b4fc' },
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#eef2ff' : 'white',
        color: state.isSelected ? 'white' : '#111827',
    }),
    menu: (provided) => ({ ...provided, zIndex: 5 }),
};

// Custom component cho breadcrumb
const Breadcrumb = ({ items }) => (
    <div className="bg-gray-100 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Selected Category Path:</h4>
        <p className="text-sm text-gray-600 font-medium bg-white p-2 rounded">{items.join(' > ')}</p>
    </div>
);

// --- Component Card để tái sử dụng ---
const FormCard = ({ icon, title, children }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
            {icon}
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        <div className="space-y-4">{children}</div>
    </div>
);


export default function CreateProductPage() {
    const navigate = useNavigate();
    const { addToast } = useToast();

    // State cho form
    const [productName, setProductName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedUnit, setSelectedUnit] = useState(unitOptions.find(u => u.value === 'pcs'));
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State cho các cấp category
    const [rootCategories, setRootCategories] = useState([]);
    const [level2Categories, setLevel2Categories] = useState([]);
    const [level3Categories, setLevel3Categories] = useState([]);

    // State cho các giá trị được chọn
    const [selectedRoot, setSelectedRoot] = useState(null);
    const [selectedLevel2, setSelectedLevel2] = useState(null);
    const [selectedLevel3, setSelectedLevel3] = useState(null);

    // State cho loading
    const [isRootLoading, setIsRootLoading] = useState(true);
    const [isLevel2Loading, setIsLevel2Loading] = useState(false);
    const [isLevel3Loading, setIsLevel3Loading] = useState(false);

    // 1. Lấy danh sách category gốc khi component được mount
    useEffect(() => {
        const fetchRootCategories = async () => {
            try {
                const response = await productService.getRootCategories();
                const formatted = response.result.map(cat => ({ value: cat.id, label: cat.category_name }));
                setRootCategories(formatted);
            } catch (error) {
                addToast("Failed to load root categories.", "error");
            } finally {
                setIsRootLoading(false);
            }
        };
        fetchRootCategories();
    }, [addToast]);

    // 2. Lấy category cấp 2 khi category gốc thay đổi
    useEffect(() => {
        if (!selectedRoot) {
            setLevel2Categories([]);
            setSelectedLevel2(null);
            return;
        }
        const fetchLevel2 = async () => {
            setIsLevel2Loading(true); setLevel2Categories([]);
            try {
                const response = await productService.getChildCategories(selectedRoot.value);
                const formatted = response.result.map(cat => ({ value: cat.id, label: cat.category_name }));
                setLevel2Categories(formatted);
            } catch (error) {
                addToast("Failed to load sub-categories.", "error");
            } finally {
                setIsLevel2Loading(false);
            }
        };
        fetchLevel2();
    }, [selectedRoot, addToast]);

    // 3. Lấy category cấp 3 khi category cấp 2 thay đổi
    useEffect(() => {
        if (!selectedLevel2) {
            setLevel3Categories([]);
            setSelectedLevel3(null);
            return;
        }
        const fetchLevel3 = async () => {
            setIsLevel3Loading(true); setLevel3Categories([]);
            try {
                const response = await productService.getChildCategories(selectedLevel2.value);
                const formatted = response.result.map(cat => ({ value: cat.id, label: cat.category_name }));
                setLevel3Categories(formatted);
            } catch (error) {
                addToast("Failed to load final categories.", "error");
            } finally {
                setIsLevel3Loading(false);
            }
        };
        fetchLevel3();
    }, [selectedLevel2, addToast]);

    // --- Cải tiến: Tạo breadcrumb cho category ---
    const categoryBreadcrumb = useMemo(() => {
        return [selectedRoot, selectedLevel2, selectedLevel3]
            .filter(Boolean)
            .map(c => c.label)
            .join(' > ');
    }, [selectedRoot, selectedLevel2, selectedLevel3]);

    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Lấy category_id cuối cùng được chọn
        const category_id = selectedLevel3?.value || selectedLevel2?.value || selectedRoot?.value;

        if (!productName || !category_id || !selectedUnit) {
            addToast("Please fill in all required fields.", "warning");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                product_name: productName,
                description,
                unit: selectedUnit.value,
                category_id,
            };
            await productService.create(payload);
            addToast("Product created successfully!", "success");
            navigate("/products");
        } catch (error) {
            console.error("Failed to create product:", error);
            addToast(error.response?.data?.message || "Failed to create product.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* --- Header không đổi --- */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Create New Product</h1>
                <div className="flex gap-2">
                    <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition disabled:bg-gray-400">
                        <FaSave /> {isSubmitting ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => navigate("/products")} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                        <FaTimes /> Cancel
                    </button>
                </div>
            </div>

            {/* --- Bố cục 2 cột --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cột chính (Form) */}
                <div className="lg:col-span-2 space-y-8">
                    <FormCard icon={<FaInfoCircle className="text-blue-500 w-6 h-6" />} title="Basic Information">
                        <div>
                            <label htmlFor="product_name" className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
                            <input type="text" id="product_name" value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                        <div>
                            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">Unit <span className="text-red-500">*</span></label>
                            <Select id="unit" options={unitOptions} value={selectedUnit} onChange={setSelectedUnit} styles={selectStyles} />
                        </div>
                    </FormCard>

                    <FormCard icon={<FaTags className="text-green-500 w-6 h-6" />} title="Categorization">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select placeholder="Root Category..." options={rootCategories} value={selectedRoot} onChange={(option) => { setSelectedRoot(option); setSelectedLevel2(null); setSelectedLevel3(null); }} isLoading={isRootLoading} styles={selectStyles} />
                            <Select placeholder="Level 2..." options={level2Categories} value={selectedLevel2} onChange={(option) => { setSelectedLevel2(option); setSelectedLevel3(null); }} isDisabled={!selectedRoot} isLoading={isLevel2Loading} styles={selectStyles} noOptionsMessage={() => 'No sub-categories'} />
                            <Select placeholder="Level 3..." options={level3Categories} value={selectedLevel3} onChange={setSelectedLevel3} isDisabled={!selectedLevel2} isLoading={isLevel3Loading} styles={selectStyles} noOptionsMessage={() => 'No sub-categories'} />
                        </div>
                    </FormCard>

                    <FormCard icon={<FaAlignLeft className="text-purple-500 w-6 h-6" />} title="Additional Details">
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                        </div>
                    </FormCard>
                </div>

                {/* Cột phụ (Hướng dẫn/Tóm tắt) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                        <h4 className="font-bold text-blue-800">Quick Guide</h4>
                        <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                            <li>Fields marked with <span className="text-red-500">*</span> are required.</li>
                            <li>Select a category from left to right.</li>
                            <li>The final selected category will be used for the product.</li>
                        </ul>
                    </div>
                    {categoryBreadcrumb && <Breadcrumb items={categoryBreadcrumb.split(' > ')} />}
                </div>
            </div>
        </div>
    );
}