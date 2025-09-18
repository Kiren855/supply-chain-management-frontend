import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaPlus, FaList, FaTh, FaSearch, FaUndo, FaArrowLeft, FaMapMarkerAlt, FaPencilAlt } from 'react-icons/fa';
import { useToast } from '@/contexts/ToastContext';
import { motion } from 'framer-motion';
import zoneService from '../service/zoneService';
import warehouseService from '../service/warehouseService';
import Pagination from '@/components/common/Pagination';
// --- 1. Import Button ---
import Button from '@/components/common/Button';
import ZoneListView from '../components/ZoneListView';
import ZoneCardView from '../components/ZoneCardView';
import UpdateWarehouseModal from '../components/UpdateWarehouseModal';
import CreateZoneModal from '../components/CreateZoneModal'; // Import modal tạo zone

const listPageSizes = [5, 10, 20, 50];
const cardPageSizes = [3, 6, 9, 12, 24];

const initialFiltersState = {
    keyword: '',
    updatedFrom: '',
    updatedTo: '',
    zoneType: '', // Thêm filter cho zone type
    page: 0,
    size: listPageSizes[0],
    sort: 'creationTimestamp,desc',
};

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
}

// 1. Thêm đầy đủ code cho ViewModeToggle
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

export default function ZoneListPage() {
    const { warehouseId } = useParams();
    const navigate = useNavigate();
    const [zones, setZones] = useState([]);
    const [warehouseInfo, setWarehouseInfo] = useState(null); // 2. Thêm state để lưu thông tin kho
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState(initialFiltersState);
    const [viewMode, setViewMode] = useState('card');
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // State cho modal update
    const debouncedKeyword = useDebounce(filters.keyword, 700);
    const { addToast } = useToast();

    const fetchWarehouseInfo = useCallback(async () => { // Bọc trong useCallback
        try {
            const response = await warehouseService.getWarehouseById(warehouseId);
            setWarehouseInfo(response.result);
        } catch (error) {
            addToast("Could not fetch warehouse details.", "error");
            navigate('/warehouses');
        }
    }, [warehouseId, addToast, navigate]);

    useEffect(() => {
        fetchWarehouseInfo();
    }, [fetchWarehouseInfo]);

    const fetchData = useCallback(async (currentFilters) => {
        setIsLoading(true);
        try {
            const response = await zoneService.getZones(warehouseId, currentFilters);
            setZones(response.result.content);
            setTotalPages(response.result.totalPages);
        } catch (error) {
            addToast("Could not fetch zones. Please try again later.", "error");
            setZones([]);
        } finally {
            setIsLoading(false);
        }
    }, [addToast, warehouseId]);

    useEffect(() => {
        const currentFilters = { ...filters, keyword: debouncedKeyword };
        fetchData(currentFilters);
    }, [debouncedKeyword, filters.updatedFrom, filters.updatedTo, filters.zoneType, filters.page, filters.size, filters.sort, fetchData]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
            // Chỉ reset về trang 0 nếu thay đổi không phải là chính nó
            page: field === 'page' ? value : 0,
        }));
    };

    const handleResetFilters = () => {
        setFilters(initialFiltersState);
        addToast("Filters have been reset.", "info");
    };

    const handleViewModeChange = (newMode) => {
        if (newMode === viewMode) return;
        setViewMode(newMode);
        const newSize = newMode === 'list' ? listPageSizes[0] : cardPageSizes[0];
        setFilters(prev => ({ ...prev, size: newSize, page: 0 }));
    };

    const handleRowDoubleClick = (zone) => {
        // Chuyển hướng đến trang danh sách bin của zone được chọn
        navigate(`/warehouses/${warehouseId}/zones/${zone.id}`);
    };

    const handleWarehouseUpdated = () => {
        // Tải lại thông tin kho sau khi cập nhật thành công
        fetchWarehouseInfo();
    };

    // Hàm xử lý việc tạo zone mới
    const handleCreateZoneSubmit = async (zoneData) => {
        try {
            await zoneService.createZone(warehouseId, zoneData);
            addToast('Zone created successfully!', 'success');
            setIsModalOpen(false); // Đóng modal
            fetchData(filters); // Tải lại danh sách zones
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to create zone.';
            addToast(message, 'error');
            // Ném lỗi để component con có thể bắt và xử lý (ví dụ: không đóng modal)
            throw new Error(message);
        }
    };

    const currentPageSizes = viewMode === 'list' ? listPageSizes : cardPageSizes;
    const isFilterActive = filters.keyword !== '' || filters.updatedFrom !== '' || filters.updatedTo !== '' || filters.zoneType !== '';

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                <div>
                    <div className="flex justify-between items-end">

                        {/* Cột bên trái: Thông tin kho */}
                        <div>
                            {warehouseInfo ? (
                                <>

                                </>
                            ) : (
                                <div className="space-y-2">
                                    <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                                </div>
                            )}
                        </div>

                        {/* Cột bên phải: Các nút hành động */}
                        <div className="flex items-center gap-4">
                            <ViewModeToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
                        </div>
                    </div>
                </div>

                {/* KHỐI FILTER (Mục thứ 2) */}
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 p-4 bg-white rounded-lg shadow-sm border">
                    {/* Search Input (chiếm 3 cột) */}
                    <div className="relative lg:col-span-3">
                        <label htmlFor="search-keyword" className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
                        <FaSearch className="absolute left-3 bottom-3 text-gray-400" />
                        <input
                            id="search-keyword"
                            type="text"
                            placeholder="By zone name or code..."
                            value={filters.keyword}
                            onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value, page: 0 }))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                    {/* Updated From */}
                    <div>
                        <label htmlFor="updated-from" className="text-sm font-medium text-gray-700 mb-1 block">Updated From</label>
                        <input
                            id="updated-from"
                            type="date"
                            value={filters.updatedFrom}
                            onChange={(e) => handleFilterChange('updatedFrom', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                    {/* Updated To */}
                    <div>
                        <label htmlFor="updated-to" className="text-sm font-medium text-gray-700 mb-1 block">Updated To</label>
                        <input
                            id="updated-to"
                            type="date"
                            value={filters.updatedTo}
                            onChange={(e) => handleFilterChange('updatedTo', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                    {/* Filter by Type */}
                    <div>
                        <label htmlFor="zone-type" className="text-sm font-medium text-gray-700 mb-1 block">Zone Type</label>
                        <select id="zone-type" value={filters.zoneType} onChange={(e) => handleFilterChange('zoneType', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                            <option value="">All Types</option>
                            <option value="STORAGE">Storage</option>
                            <option value="PICKING">Picking</option>
                            <option value="DOCK">Dock</option>
                            <option value="STAGING">Staging</option>
                        </select>
                    </div>

                    {/* Nút Reset */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block invisible">Reset</label>
                        <Button
                            onClick={handleResetFilters}
                            disabled={!isFilterActive}
                            title="Reset Filters"
                            variant="danger"
                            className="w-full"
                        >
                            <FaUndo />
                            Reset
                        </Button>
                    </div>

                    {/* Nút Create Zone */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block invisible">Create</label>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            variant="info"
                            className="w-full"
                        >
                            <FaPlus /> Create
                        </Button>
                    </div>
                </div>

                {viewMode === 'list' ? (
                    <ZoneListView
                        zones={zones}
                        isLoading={isLoading}
                        page={filters.page}
                        size={filters.size}
                        onRowDoubleClick={handleRowDoubleClick}
                    />
                ) : (
                    <ZoneCardView zones={zones} isLoading={isLoading} onRowDoubleClick={handleRowDoubleClick} />
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
                            <option value="zone_name,asc">Name (A-Z)</option>
                            <option value="zone_name,desc">Name (Z-A)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Thêm modal update vào cuối file */}
            {warehouseInfo && (
                <UpdateWarehouseModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    warehouseData={warehouseInfo}
                    onWarehouseUpdated={handleWarehouseUpdated}
                />
            )}
            <CreateZoneModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateZoneSubmit}
            />
        </div>
    );
}