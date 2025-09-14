import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import productService from "@/modules/product-catalog/service/productService";
import Pagination from "@/components/common/Pagination";
import { useToast } from "@/contexts/ToastContext";
import { FaEdit, FaTrash, FaArrowLeft, FaBoxOpen, FaCube, FaBarcode, FaSave, FaTimes, FaTags, FaPlus } from "react-icons/fa";
import PackageModal from '../components/PackageModal';
import ConfirmationModal from '@/components/common/ConfirmationModal'; // 1. Import modal xác nhận

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

const selectStyles = {
    control: (provided) => ({ ...provided, borderColor: '#d1d5db', borderRadius: '0.375rem', minHeight: '42px', boxShadow: 'none', '&:hover': { borderColor: '#a5b4fc' } }),
    option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#eef2ff' : 'white', color: state.isSelected ? 'white' : '#111827' }),
    menu: (provided) => ({ ...provided, zIndex: 5 }),
};

const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full";
    const statusClasses = { ACTIVE: "bg-green-100 text-green-800", INACTIVE: "bg-yellow-100 text-yellow-800" };
    return <span className={`${baseClasses} ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
};

const InfoCard = ({ label, value, icon, children }) => (
    <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-1">{icon}<span>{label}</span></div>
        {children || <p className="text-lg font-bold text-gray-800">{value}</p>}
    </div>
);


export default function ProductDetailPage() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [product, setProduct] = useState(null);
    const [packages, setPackages] = useState([]);
    const [packagePage, setPackagePage] = useState(0);
    const [packageTotalPages, setPackageTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [editedDescription, setEditedDescription] = useState("");
    const [editedUnit, setEditedUnit] = useState(null);
    const [rootCategories, setRootCategories] = useState([]);
    const [level2Categories, setLevel2Categories] = useState([]);
    const [level3Categories, setLevel3Categories] = useState([]);
    const [selectedRoot, setSelectedRoot] = useState(null);
    const [selectedLevel2, setSelectedLevel2] = useState(null);
    const [selectedLevel3, setSelectedLevel3] = useState(null);
    const [isCategoryLoading, setIsCategoryLoading] = useState(false);

    const [selectedPackages, setSelectedPackages] = useState([]);
    const [isPackageLoading, setIsPackageLoading] = useState(false);

    // 2. State mới để quản lý modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null); // null: create, object: update

    // 2. State để quản lý modal xác nhận
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [productResponse, packagesResponse] = await Promise.all([
                    productService.getDetail(productId),
                    productService.getPackages(productId, 0, 5)
                ]);
                setProduct(productResponse.result);
                setPackages(packagesResponse.result.content);
                setPackagePage(packagesResponse.result.pageNumber);
                setPackageTotalPages(packagesResponse.result.totalPages);
                setEditedName(productResponse.result.product_name);
                setEditedDescription(productResponse.result.description || "");
                setEditedUnit(unitOptions.find(u => u.value === productResponse.result.unit));
            } catch (error) {
                addToast("Could not load product data.", "error");
                navigate("/products");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [productId, navigate, addToast]);

    useEffect(() => {
        if (!isEditing) return;
        const fetchRoot = async () => {
            setIsCategoryLoading(true);
            try {
                const response = await productService.getRootCategories();
                setRootCategories(response.result.map(cat => ({ value: cat.id, label: cat.category_name })));
            } catch (error) { addToast("Failed to load categories.", "error"); }
            finally { setIsCategoryLoading(false); }
        };
        fetchRoot();
    }, [isEditing, addToast]);

    useEffect(() => {
        if (!selectedRoot) { setLevel2Categories([]); setSelectedLevel2(null); return; }
        const fetchL2 = async () => {
            const response = await productService.getChildCategories(selectedRoot.value);
            setLevel2Categories(response.result.map(cat => ({ value: cat.id, label: cat.category_name })));
        };
        fetchL2();
    }, [selectedRoot]);

    useEffect(() => {
        if (!selectedLevel2) { setLevel3Categories([]); setSelectedLevel3(null); return; }
        const fetchL3 = async () => {
            const response = await productService.getChildCategories(selectedLevel2.value);
            setLevel3Categories(response.result.map(cat => ({ value: cat.id, label: cat.category_name })));
        };
        fetchL3();
    }, [selectedLevel2]);

    const handleEditToggle = () => {
        if (isEditing) { // Cancel action
            setEditedName(product.product_name);
            setEditedDescription(product.description || "");
            setEditedUnit(unitOptions.find(u => u.value === product.unit));
            setSelectedRoot(null); setSelectedLevel2(null); setSelectedLevel3(null);
        }
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const newCategoryId = selectedLevel3?.value || selectedLevel2?.value || selectedRoot?.value;
        const payload = {
            product_name: editedName,
            description: editedDescription,
            unit: editedUnit.value,
        };
        if (newCategoryId) {
            payload.category_id = newCategoryId;
        }

        try {
            await productService.update(productId, payload);
            const updatedProductResponse = await productService.getDetail(productId);
            setProduct(updatedProductResponse.result);
            addToast("Product updated successfully!", "success");
            setIsEditing(false);
        } catch (error) {
            addToast(error.response?.data?.message || "Failed to update product.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const fetchPackages = async (page) => {
        setIsPackageLoading(true);
        setSelectedPackages([]);
        try {
            const response = await productService.getPackages(productId, page, 5);
            setPackages(response.result.content);
            setPackagePage(response.result.pageNumber);
            setPackageTotalPages(response.result.totalPages);
        } catch (error) {
            addToast("Could not load packages.", "error");
        } finally {
            setIsPackageLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingPackage(null);
        setIsModalOpen(true);
    };

    const openUpdateModal = () => {
        const packageToEdit = packages.find(p => p.id === selectedPackages[0]);
        if (packageToEdit) {
            setEditingPackage(packageToEdit);
            setIsModalOpen(true);
        }
    };

    const handleModalSubmit = async (payload) => {
        try {
            if (editingPackage) { // Update mode
                await productService.updatePackage(productId, editingPackage.id, payload);
                addToast("Package updated successfully!", "success");
            } else { // Create mode
                await productService.createPackage(productId, payload);
                addToast("Package created successfully!", "success");
            }
            setIsModalOpen(false);
            fetchPackages(packagePage); // Tải lại danh sách package
        } catch (error) {
            addToast(error.response?.data?.message || "Operation failed.", "error");
        }
    };

    const handleSelectPackage = (pkgId) => {
        setSelectedPackages(prev =>
            prev.includes(pkgId)
                ? prev.filter(id => id !== pkgId)
                : [...prev, pkgId]
        );
    };

    // 3. Cập nhật các hàm xoá để sử dụng modal
    const handleDeleteProductRequest = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Product',
            message: `Are you sure you want to delete the product "${product.product_name}"? This action cannot be undone.`,
            onConfirm: () => handleDeleteProduct(),
        });
    };

    const handleDeleteProduct = async () => {
        setIsConfirming(true);
        try {
            await productService.delete(productId);
            addToast("Product deleted successfully", "success");
            navigate("/products");
        } catch (error) {
            addToast("Failed to delete product.", "error");
            setIsConfirming(false);
            closeConfirmModal();
        }
    };

    const handleDeletePackagesRequest = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Package(s)',
            message: `Are you sure you want to delete ${selectedPackages.length} selected package(s)?`,
            onConfirm: () => handleDeletePackages(),
        });
    };

    const handleDeletePackages = async () => {
        setIsConfirming(true);
        try {
            // Thay thế Promise.all bằng một lệnh gọi API duy nhất
            await productService.deletePackages(productId, selectedPackages);
            addToast(`${selectedPackages.length} package(s) deleted successfully.`, "success");
            // Tải lại trang đầu tiên để tránh lỗi trang không tồn tại nếu trang hiện tại bị xóa hết
            fetchPackages(0);
        } catch (error) {
            addToast(error.response?.data?.message || "Failed to delete package(s).", "error");
        } finally {
            setIsConfirming(false);
            closeConfirmModal();
        }
    };

    const closeConfirmModal = () => {
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
    };


    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!product) return <div className="p-8 text-center text-red-500">Product not found.</div>;

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <button onClick={() => navigate('/products')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-2"><FaArrowLeft /> Back to List</button>
                    {isEditing ? (
                        <input type="text" value={editedName} onChange={e => setEditedName(e.target.value)} className="text-3xl font-extrabold text-gray-800 border-b-2 border-blue-500 focus:outline-none bg-transparent" />
                    ) : (
                        <h1 className="text-3xl text-left font-extrabold text-gray-800">{product.product_name}</h1>
                    )}
                    <p className="text-sm text-left text-gray-500 mt-1">{product.category_names?.join(' > ')}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition disabled:bg-gray-400">
                                <FaSave /> {isSaving ? "Saving..." : "Save"}
                            </button>
                            <button onClick={handleEditToggle} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                                <FaTimes /> Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={handleEditToggle} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"><FaEdit /> Edit</button>
                            {/* 4. Cập nhật onClick cho nút xoá sản phẩm */}
                            <button onClick={handleDeleteProductRequest} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"><FaTrash /> Delete</button>
                        </>
                    )}
                </div>
            </div>

            {/* Product Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="md:col-span-1 bg-white p-6 rounded-xl shadow border space-y-4">
                    <InfoCard label="Status" value={<StatusBadge status={product.status} />} icon={<FaBoxOpen className="text-green-500" />} />
                    <InfoCard label="SKU" value={product.product_sku} icon={<FaBarcode className="text-blue-500" />} />
                    <InfoCard label="Base Unit" icon={<FaCube className="text-purple-500" />}>
                        {isEditing ? (
                            <Select options={unitOptions} value={editedUnit} onChange={setEditedUnit} styles={selectStyles} />
                        ) : (
                            <p className="text-lg font-bold text-gray-800">{product.unit}</p>
                        )}
                    </InfoCard>
                </div>
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow border">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Description</h3>
                    {isEditing ? (
                        <textarea value={editedDescription} onChange={e => setEditedDescription(e.target.value)} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-50" />
                    ) : (
                        <p className="text-gray-600 whitespace-pre-wrap">{product.description || "No description available."}</p>
                    )}
                </div>
            </div>

            {/* Change Category Section (chỉ hiển thị khi editing) */}
            {isEditing && (
                <div className="bg-white p-6 rounded-xl shadow border mt-8">
                    <div className="flex items-center gap-3 mb-4">
                        <FaTags className="text-green-500 w-6 h-6" />
                        <h3 className="text-xl font-bold text-gray-800">Change Category</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select placeholder="New Root Category..." options={rootCategories} value={selectedRoot} onChange={(o) => { setSelectedRoot(o); setSelectedLevel2(null); setSelectedLevel3(null); }} isLoading={isCategoryLoading} styles={selectStyles} />
                        <Select placeholder="New Level 2..." options={level2Categories} value={selectedLevel2} onChange={(o) => { setSelectedLevel2(o); setSelectedLevel3(null); }} isDisabled={!selectedRoot} styles={selectStyles} noOptionsMessage={() => 'No sub-categories'} />
                        <Select placeholder="New Level 3..." options={level3Categories} value={selectedLevel3} onChange={setSelectedLevel3} isDisabled={!selectedLevel2} styles={selectStyles} noOptionsMessage={() => 'No sub-categories'} />
                    </div>
                </div>
            )}

            {/* Packages Section */}
            <div className="bg-white p-6 rounded-xl shadow border mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl text-left font-bold text-gray-800">Product Packages</h3>
                    {!isEditing && (
                        <div className="flex gap-2">
                            <button onClick={openCreateModal} className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
                                <FaPlus /> Create
                            </button>
                            <button onClick={openUpdateModal} disabled={selectedPackages.length !== 1} className="flex items-center gap-2 px-3 py-2 text-sm bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed">
                                <FaEdit /> Update
                            </button>
                            {/* 5. Cập nhật onClick cho nút xoá package */}
                            <button onClick={handleDeletePackagesRequest} disabled={selectedPackages.length === 0} className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed">
                                <FaTrash /> Delete
                            </button>
                        </div>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {!isEditing && <th className="w-12 px-6 py-3"></th>}
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Package Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Barcode</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Dimensions</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Weight</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty in Parent</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {isPackageLoading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading packages...</td></tr>
                            ) : packages.length > 0 ? (
                                packages.map(pkg => (
                                    <tr key={pkg.id} onClick={() => !isEditing && handleSelectPackage(pkg.id)} className={`transition-colors ${!isEditing ? 'cursor-pointer hover:bg-blue-50' : ''} ${selectedPackages.includes(pkg.id) ? 'bg-blue-100' : ''}`}>
                                        {!isEditing && (
                                            <td className="px-6 py-4">
                                                <input type="checkbox" checked={selectedPackages.includes(pkg.id)} onChange={() => { }} className="cursor-pointer" />
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-left text-sm font-medium text-gray-800">{pkg.package_type}</td>
                                        <td className="px-6 py-4 text-left text-sm text-gray-600 font-mono">{pkg.barcode}</td>
                                        <td className="px-6 py-4 text-center text-sm">{`${pkg.length}×${pkg.width}×${pkg.height}`}</td>
                                        <td className="px-6 py-4 text-center text-sm">{pkg.weight} kg</td>
                                        <td className="px-6 py-4 text-center text-sm">{pkg.quantity_in_parent}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No packages found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {packageTotalPages > 1 && (
                    <div className="mt-4 flex justify-center">
                        <Pagination currentPage={packagePage} totalPages={packageTotalPages} onPageChange={fetchPackages} />
                    </div>
                )}
            </div>

            {/* Modal tạo/sửa package */}
            <PackageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={editingPackage}
            />

            {/* 6. Render modal xác nhận */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />

        </div>
    );

}