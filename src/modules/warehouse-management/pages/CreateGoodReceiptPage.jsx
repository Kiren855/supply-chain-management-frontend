import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom'; // Thêm import
import { useToast } from '@/contexts/ToastContext'; // Thêm import
import warehouseService from '../service/warehouseService';
import Button from '@/components/common/Button';
import Pagination from '@/components/common/Pagination';
import SelectProductModal from '../components/SelectProductModal';

const CreateGoodReceiptPage = () => {
    const { warehouseId } = useParams(); // Lấy warehouseId từ URL
    const navigate = useNavigate(); // Hook để điều hướng
    const { addToast } = useToast(); // Hook để hiển thị toast
    const [selectedProducts, setSelectedProducts] = useState([]); // Danh sách sản phẩm đã chọn
    const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái mở modal
    const [productPackages, setProductPackages] = useState([]); // Danh sách package của sản phẩm
    const [filters, setFilters] = useState({ keyword: '', page: 0, size: 5 }); // Filter cho modal
    const [products, setProducts] = useState([]); // Danh sách sản phẩm active
    const [totalPages, setTotalPages] = useState(1); // Tổng số trang trong modal

    // Fetch danh sách sản phẩm active
    const fetchProducts = useCallback(async () => {
        try {
            const response = await warehouseService.getActiveProducts(filters);
            setProducts(response.result.content);
            setTotalPages(response.result.totalPages);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    }, [filters]);

    useEffect(() => {
        if (isModalOpen) {
            fetchProducts();
        }
    }, [isModalOpen, fetchProducts]);

    // Fetch danh sách package của sản phẩm
    const fetchProductPackages = async (productId) => {
        try {
            const response = await warehouseService.getProductPackages(productId);
            return response.result;
        } catch (error) {
            console.error('Failed to fetch product packages:', error);
            return [];
        }
    };

    // Thêm sản phẩm vào danh sách (cập nhật quantity thành string)
    const handleAddProduct = async (product) => {
        const packages = await fetchProductPackages(product.id);
        setSelectedProducts((prev) => [
            ...prev,
            { ...product, packages, selectedPackageId: packages[0]?.id || null, quantity: "1" }, // quantity là string
        ]);
        setIsModalOpen(false);
    };

    // Xóa sản phẩm khỏi danh sách
    const handleRemoveProduct = (productId) => {
        setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
    };

    // Gửi dữ liệu tạo Good Receipt (cập nhật để convert quantity thành number)
    const handleSubmit = async () => {
        const productPackages = selectedProducts.map((product) => ({
            product_package_id: product.selectedPackageId,
            package_quantity: Number(product.quantity) || 1, // Convert thành number, mặc định 1 nếu invalid
        }));

        try {
            await warehouseService.createGoodReceipt(warehouseId, { product_packages: productPackages }); // Sử dụng warehouseId từ params
            addToast('Good Receipt created successfully!', 'success'); // Hiển thị toast thành công
            navigate(`/warehouses/${warehouseId}/good-receipts`); // Quay lại danh sách Good Receipts
        } catch (error) {
            console.error('Failed to create Good Receipt:', error);
            addToast('Failed to create Good Receipt.', 'error'); // Hiển thị toast lỗi
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-gray-800">Create Good Receipt</h1>

                {/* Danh sách sản phẩm đã chọn - Cải tiến UI/UX giống CreateGroupPage */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                                        Product SKU
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                                        Product Name
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                                        Package
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                                        Quantity
                                    </th>
                                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {selectedProducts.length > 0 ? (
                                    selectedProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-800">{product.product_sku}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{product.product_name}</td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={product.selectedPackageId || ''}
                                                    onChange={(e) =>
                                                        setSelectedProducts((prev) =>
                                                            prev.map((p) =>
                                                                p.id === product.id
                                                                    ? { ...p, selectedPackageId: e.target.value }
                                                                    : p
                                                            )
                                                        )
                                                    }
                                                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    {product.packages.map((pkg) => (
                                                        <option key={pkg.id} value={pkg.id}>
                                                            {pkg.package_type} - {pkg.barcode}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={product.quantity}
                                                    onChange={(e) =>
                                                        setSelectedProducts((prev) =>
                                                            prev.map((p) =>
                                                                p.id === product.id
                                                                    ? { ...p, quantity: e.target.value }
                                                                    : p
                                                            )
                                                        )
                                                    }
                                                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="1"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleRemoveProduct(product.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                            No products selected yet. Click "Add Product" to start.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Nút thêm sản phẩm */}
                <Button onClick={() => setIsModalOpen(true)} variant="primary" className="flex items-center gap-2">
                    <FaPlus /> Add Product
                </Button>

                {/* Nút submit */}
                <Button onClick={handleSubmit} variant="success" className="w-full">
                    Submit Good Receipt
                </Button>
            </div>

            {/* Modal chọn sản phẩm */}
            <SelectProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectProducts={async (selectedProducts) => {
                    // Loại bỏ duplicate trong selectedProducts (nếu có)
                    const uniqueSelectedProducts = selectedProducts.filter((product, index, self) =>
                        index === self.findIndex((p) => p.id === product.id)
                    );

                    // Sử dụng setSelectedProducts với callback để kiểm tra trùng lặp
                    setSelectedProducts((prev) => {
                        const newProducts = uniqueSelectedProducts.filter((product) =>
                            !prev.some((existing) => existing.id === product.id)
                        );

                        // Thêm sản phẩm mới với packages tạm thời
                        const tempProducts = newProducts.map((product) => ({
                            ...product,
                            packages: [],
                            selectedPackageId: null,
                            quantity: "1", // quantity là string
                        }));

                        // Fetch packages và cập nhật
                        Promise.all(
                            newProducts.map(async (product) => {
                                const packages = await fetchProductPackages(product.id);
                                return { id: product.id, packages };
                            })
                        ).then((results) => {
                            setSelectedProducts((currentPrev) =>
                                currentPrev.map((p) => {
                                    const result = results.find((r) => r.id === p.id);
                                    if (result) {
                                        return {
                                            ...p,
                                            packages: result.packages,
                                            selectedPackageId: result.packages[0]?.id || null,
                                        };
                                    }
                                    return p;
                                })
                            );
                        });

                        return [...prev, ...tempProducts];
                    });
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
};

export default CreateGoodReceiptPage;