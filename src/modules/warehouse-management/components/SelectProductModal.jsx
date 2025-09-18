import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaTimes, FaCheck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion'; // Thêm import Framer Motion
import warehouseService from '../service/warehouseService';
import Button from '@/components/common/Button';
import Pagination from '@/components/common/Pagination';

// Custom hook: useDebounce
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

const SelectProductModal = ({ isOpen, onClose, onSelectProducts }) => {
    const [filters, setFilters] = useState({ keyword: '', page: 0, size: 5 });
    const [products, setProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]); // Danh sách sản phẩm được chọn

    const debouncedKeyword = useDebounce(filters.keyword, 500); // Debounce tìm kiếm

    // Fetch danh sách sản phẩm active
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await warehouseService.getActiveProducts({
                keyword: debouncedKeyword,
                page: filters.page,
                size: filters.size,
            });
            setProducts(response.result.content);
            setTotalPages(response.result.totalPages);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedKeyword, filters.page, filters.size]);

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen, fetchProducts]);

    // Xử lý chọn/bỏ chọn sản phẩm
    const handleSelectProduct = (productId) => {
        setSelectedProducts((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId) // Bỏ chọn
                : [...prev, productId] // Chọn
        );
    };

    // Xác nhận các sản phẩm đã chọn
    const handleConfirmSelection = () => {
        const selectedProductDetails = products.filter((product) =>
            selectedProducts.includes(product.id)
        );
        onSelectProducts(selectedProductDetails); // Trả về danh sách sản phẩm đã chọn
        onClose(); // Đóng modal
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 flex justify-center items-center p-4 z-50"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} // Sử dụng inline style để đảm bảo opacity 0.5
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        className="bg-white rounded-lg shadow-lg w-full max-w-4xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800">Select Products</h2>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                                <FaTimes />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="p-4 bg-gray-50 border-b">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search product..."
                                        value={filters.keyword}
                                        onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value, page: 0 }))}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Product List - Giống CreateGroupPage */}
                        <div className="p-4">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="w-12 px-4 py-2"></th>
                                            <th className="w-1/5 px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Product SKU</th>
                                            <th className="w-2/5 px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Product Name</th>
                                            <th className="w-2/5 px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Product Category</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan="4" className="text-center py-8 text-gray-500">Loading products...</td>
                                            </tr>
                                        ) : products.length > 0 ? (
                                            products.map((product) => (
                                                <tr
                                                    key={product.id}
                                                    className="hover:bg-gray-50 cursor-pointer"
                                                    onClick={() => handleSelectProduct(product.id)}
                                                >
                                                    <td className="px-4 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                                                            checked={selectedProducts.includes(product.id)}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-left font-medium text-gray-800">{product.product_sku}</td>
                                                    <td className="px-4 py-3 text-left text-sm text-gray-600">{product.product_name}</td>
                                                    <td className="px-4 py-3 text-left text-sm text-gray-600">{product.category_name}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-8 text-gray-500">No products found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className="p-4 border-t bg-gray-50">
                            <Pagination
                                currentPage={filters.page}
                                totalPages={totalPages}
                                onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                            />
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t flex justify-between">
                            <span className="text-sm text-gray-500">
                                Selected: {selectedProducts.length} product(s)
                            </span>
                            <div className="flex gap-2">
                                <Button onClick={onClose} variant="danger">
                                    Cancel
                                </Button>
                                <Button onClick={handleConfirmSelection} variant="success">
                                    <FaCheck className="mr-2" /> Confirm
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SelectProductModal;