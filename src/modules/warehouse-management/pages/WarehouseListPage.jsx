import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaList, FaTh, FaSearch, FaUndo } from 'react-icons/fa';
import { useToast } from '@/contexts/ToastContext';
import { motion } from 'framer-motion';
import warehouseService from '../service/warehouseService';
import Pagination from '@/components/common/Pagination';
import WarehouseListView from '../components/WarehouseListView';
import WarehouseCardView from '../components/WarehouseCardView';
import CreateWarehouseModal from '../components/CreateWarehouseModal'; // Import modal mới

const listPageSizes = [10, 20, 50];
const cardPageSizes = [9, 12, 24];

// 1. Định nghĩa trạng thái filter ban đầu để dễ dàng reset
const initialFiltersState = {
    keyword: '',
    status: '', // Thêm status vào state filter ban đầu
    createdFrom: '',
    createdTo: '',
    page: 0,
    size: listPageSizes[0],
    sort: 'creationTimestamp,desc',
};

// Custom hook để debounce giá trị
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
}

const ViewModeToggle = ({ viewMode, onViewModeChange }) => {
    return (
        <div className="flex items-center p-1 bg-gray-200 rounded-lg">
            <button
                onClick={() => onViewModeChange('list')}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'list' ? 'text-white' : 'text-gray-600 hover:text-gray-800'}`}
            >
                {viewMode === 'list' && (
                    <motion.div
                        layoutId="viewModeHighlight"
                        className="absolute inset-0 bg-blue-600 rounded-md shadow"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                )}
                <span className="relative z-10 flex items-center gap-2"><FaList /> List</span>
            </button>
            <button
                onClick={() => onViewModeChange('card')}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'card' ? 'text-white' : 'text-gray-600 hover:text-gray-800'}`}
            >
                {viewMode === 'card' && (
                    <motion.div
                        layoutId="viewModeHighlight"
                        className="absolute inset-0 bg-blue-600 rounded-md shadow"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                )}
                <span className="relative z-10 flex items-center gap-2"><FaTh /> Card</span>
            </button>
        </div>
    );
};


export default function WarehouseListPage() {
    const [warehouses, setWarehouses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Sử dụng state ban đầu đã định nghĩa
    const [filters, setFilters] = useState(initialFiltersState);

    const [viewMode, setViewMode] = useState('list');
    const [totalPages, setTotalPages] = useState(1);

    // 2. Thêm state để quản lý modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { addToast } = useToast();
    const navigate = useNavigate();

    // Thêm dòng bị thiếu để tạo debouncedKeyword
    const debouncedKeyword = useDebounce(filters.keyword, 700);

    // 2. Hàm fetch data được đơn giản hóa
    const fetchData = useCallback(async (currentFilters) => {
        setIsLoading(true);
        try {
            const response = await warehouseService.getWarehouses(currentFilters);
            setWarehouses(response.result.content);
            setTotalPages(response.result.totalPages);
        } catch (error) {
            addToast("Could not fetch data. Please try again later.", "error");
            setWarehouses([]);
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    // 3. useEffect chính để fetch dữ liệu khi các tham số thay đổi
    useEffect(() => {
        // Tạo một bản sao của filters và cập nhật keyword đã được debounce
        const currentFilters = { ...filters, keyword: debouncedKeyword };
        fetchData(currentFilters);
    }, [debouncedKeyword, filters.status, filters.createdFrom, filters.createdTo, filters.page, filters.size, filters.sort, fetchData]);

    // 3. Hàm xử lý khi submit form tạo mới
    const handleCreateSubmit = async (warehouseData) => {
        try {
            await warehouseService.createWarehouse(warehouseData);
            addToast("Warehouse created successfully!", "success");
            setIsModalOpen(false); // Đóng modal
            fetchData(filters); // Tải lại dữ liệu để hiển thị kho mới
        } catch (error) {
            addToast(error.response?.data?.message || "Failed to create warehouse.", "error");
        }
    };

    // 4. Hàm xử lý thay đổi chung cho các filter
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
            page: 0, // Reset về trang đầu tiên khi thay đổi bất kỳ filter nào
        }));
    };

    // 2. Hàm để reset tất cả các filter về trạng thái ban đầu
    const handleResetFilters = () => {
        setFilters(initialFiltersState);
        addToast("Filters have been reset.", "info");
    };

    const handleViewModeChange = (newMode) => {
        if (newMode === viewMode) return;
        setViewMode(newMode);
        const newSize = newMode === 'list' ? listPageSizes[0] : cardPageSizes[0];
        // Khi đổi view, cũng reset luôn filter để tránh nhầm lẫn
        setFilters({
            ...initialFiltersState,
            size: newSize,
        });
    };

    const handleRowDoubleClick = (warehouse) => {
        // Sửa lại hàm này để navigate
        navigate(`/warehouses/${warehouse.id}/zones`);
    };

    const currentPageSizes = viewMode === 'list' ? listPageSizes : cardPageSizes;

    // 3. Biến để kiểm tra xem có filter nào đang được áp dụng không
    const isFilterActive = filters.keyword !== '' || filters.status !== '' || filters.createdFrom !== '' || filters.createdTo !== '';

    const handleWarehouseCreated = () => {
        // Hàm này được gọi sau khi tạo kho thành công để tải lại dữ liệu
        fetchData(filters);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Thanh điều khiển chính */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">Warehouse Management</h1>
                    <div className="flex items-center gap-4">
                        <ViewModeToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
                        {/* 4. Cập nhật nút Create để mở modal */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                            <FaPlus /> Create
                        </button>
                    </div>
                </div>

                {/* Thanh công cụ tìm kiếm và lọc */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-white rounded-lg shadow-sm border">
                    {/* Search Input */}
                    <div className="relative lg:col-span-2">
                        <label htmlFor="search-keyword" className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
                        <FaSearch className="absolute left-3 bottom-3 text-gray-400" />
                        <input
                            id="search-keyword"
                            type="text"
                            placeholder="By name or code..."
                            value={filters.keyword}
                            onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>
                    {/* Status Filter - MỚI */}
                    <div>
                        <label htmlFor="status-filter" className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                        <select
                            id="status-filter"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        >
                            <option value="">All</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                    {/* Created From */}
                    <div>
                        <label htmlFor="created-from" className="text-sm font-medium text-gray-700 mb-1 block">Created From</label>
                        <input
                            id="created-from"
                            type="date"
                            value={filters.createdFrom}
                            onChange={(e) => handleFilterChange('createdFrom', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>
                    {/* Created To */}
                    <div>
                        <label htmlFor="created-to" className="text-sm font-medium text-gray-700 mb-1 block">Created To</label>
                        <input
                            id="created-to"
                            type="date"
                            value={filters.createdTo}
                            onChange={(e) => handleFilterChange('createdTo', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                    {/* 4. Nút Reset Filters - phiên bản icon nhỏ gọn */}
                    <div className="flex items-end justify-end">
                        <button
                            onClick={handleResetFilters}
                            disabled={!isFilterActive}
                            title="Reset Filters"
                            className={`flex items-center justify-center p-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white 
                                        ${isFilterActive ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'} 
                                        transition-all transform hover:scale-110`}
                        >
                            <FaUndo />
                        </button>
                    </div>
                </div>

                {/* Hiển thị kết quả */}
                {viewMode === 'list' ? (
                    <WarehouseListView warehouses={warehouses} isLoading={isLoading} page={filters.page} size={filters.size} onRowDoubleClick={handleRowDoubleClick} />
                ) : (
                    <WarehouseCardView warehouses={warehouses} isLoading={isLoading} onRowDoubleClick={handleRowDoubleClick} />
                )}

                {/* Phân trang và các tùy chọn */}
                <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2 text-sm">
                        <label htmlFor="pageSize" className="text-gray-700 font-medium">Items per page:</label>
                        <select id="pageSize" value={filters.size} onChange={(e) => handleFilterChange('size', Number(e.target.value))} className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500">
                            {currentPageSizes.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    {totalPages > 1 && (
                        <Pagination currentPage={filters.page} totalPages={totalPages} onPageChange={(p) => handleFilterChange('page', p)} />
                    )}
                    <div className="flex items-center gap-2 text-sm">
                        <label htmlFor="sort-select" className="text-gray-700 font-medium">Sort by:</label>
                        <select id="sort-select" value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500">
                            <option value="creationTimestamp,desc">Newest</option>
                            <option value="creationTimestamp,asc">Oldest</option>
                            <option value="warehouseName,asc">Name (A-Z)</option>
                            <option value="warehouseName,desc">Name (Z-A)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 5. Thêm component Modal vào cuối */}
            <CreateWarehouseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onWarehouseCreated={handleWarehouseCreated}
            />
        </div>
    );
}