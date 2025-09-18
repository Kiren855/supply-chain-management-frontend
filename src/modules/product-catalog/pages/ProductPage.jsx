import { useEffect, useState } from "react";
import productService from "@/modules/product-catalog/service/productService";
import { useNavigate } from "react-router-dom";
import Pagination from "@/components/common/Pagination";
import { FaPlus } from "react-icons/fa";

// Component nhỏ để hiển thị Status Badge
const StatusBadge = ({ status }) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    const statusClasses = {
        ACTIVE: "bg-green-100 text-green-800",
        INACTIVE: "bg-red-100 text-red-800",
    };
    return (
        <span className={`${baseClasses} ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchProducts = async (pageNumber = 0, pageSize = size) => {
        setLoading(true);
        try {
            const response = await productService.getList(pageNumber, pageSize);
            setProducts(response.result.content);
            setTotalPages(response.result.totalPages);
            setPage(response?.result?.pageNumber ?? 0);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(0, size);
    }, [size]);

    const handlePageChange = (newPage) => {
        fetchProducts(newPage, size);
    };

    const handleRowDoubleClick = (product) => {
        navigate(`/products/${product.id}`);
    };

    return (
        <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Product Catalog</h1>
                <button
                    onClick={() => navigate('/products/create')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                >
                    <FaPlus /> Create Product
                </button>
            </div>

            <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">STT</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                        ) : products.length > 0 ? (
                            products.map((product, idx) => (
                                <tr key={product.id} className="hover:bg-blue-50 cursor-pointer transition" onDoubleClick={() => handleRowDoubleClick(product)}>
                                    <td className="px-6 py-4 text-sm text-gray-700">{page * size + idx + 1}</td>
                                    <td className="px-6 py-4 text-left text-sm text-gray-800 font-medium">{product.product_name}</td>
                                    <td className="px-6 py-4 text-left text-sm text-gray-600 font-mono">{product.product_sku}</td>
                                    <td className="px-6 py-4 text-left text-sm text-gray-700">{product.category_name}</td>
                                    <td className="px-6 py-4 text-center text-sm text-gray-700">{product.unit}</td>
                                    <td className="px-6 py-4 text-center text-sm text-gray-700"><StatusBadge status={product.status} /></td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No products found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-2 text-sm">
                    <label htmlFor="pageSize" className="text-gray-700 font-medium">Items per page:</label>
                    <select id="pageSize" value={size} onChange={(e) => setSize(Number(e.target.value))} className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
                <div></div>
            </div>
        </div>
    );
}