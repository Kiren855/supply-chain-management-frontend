import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// --- Thêm icon FaPencilAlt ---
import { FaPlus, FaList, FaTh, FaUndo, FaArrowLeft, FaLayerGroup, FaPencilAlt } from 'react-icons/fa';
import { useToast } from '@/contexts/ToastContext';
import { motion } from 'framer-motion';
import binService from '../service/binService';
import zoneService from '../service/zoneService';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/common/Button';
import BinListView from '../components/BinListView';
import BinCardView from '../components/BinCardView';
import CreateBinModal from '../components/CreateBinModal';
// --- 1. Import modal mới ---
import UpdateZoneModal from '../components/UpdateZoneModal';

const listPageSizes = [10, 20, 50];
const cardPageSizes = [9, 12, 24];

const initialFiltersState = {
    keyword: '',
    updatedFrom: '',
    updatedTo: '',
    binType: '',
    binStatus: '',
    contentStatus: '',
    page: 0,

    size: cardPageSizes[0],
    sort: 'updateTimestamp,desc',
};

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
}

const ViewModeToggle = ({ viewMode, onViewModeChange }) => (
    <div className="flex items-center p-1 bg-gray-200 rounded-lg">
        <button onClick={() => onViewModeChange('list')} className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'list' ? 'text-white' : 'text-gray-600 hover:text-gray-800'}`}>
            {viewMode === 'list' && <motion.div layoutId="viewModeHighlightBin" className="absolute inset-0 bg-blue-600 rounded-md shadow" />}
            <span className="relative z-10 flex items-center gap-2"><FaList /> List</span>
        </button>
        <button onClick={() => onViewModeChange('card')} className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'card' ? 'text-white' : 'text-gray-600 hover:text-gray-800'}`}>
            {viewMode === 'card' && <motion.div layoutId="viewModeHighlightBin" className="absolute inset-0 bg-blue-600 rounded-md shadow" />}
            <span className="relative z-10 flex items-center gap-2"><FaTh /> Card</span>
        </button>
    </div>
);

export default function BinListPage() {
    const { warehouseId, zoneId } = useParams();
    const navigate = useNavigate();
    const [bins, setBins] = useState([]);
    const [zoneInfo, setZoneInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState(initialFiltersState);
    const [viewMode, setViewMode] = useState('card');
    const [totalPages, setTotalPages] = useState(1);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    // --- 2. Thêm state cho modal update ---
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const debouncedKeyword = useDebounce(filters.keyword, 700);
    const { addToast } = useToast();

    const fetchZoneInfo = useCallback(async () => {
        try {
            const response = await zoneService.getZoneById(warehouseId, zoneId);
            setZoneInfo(response.result);
        } catch (error) {
            addToast("Could not fetch zone details.", "error");
            navigate(`/warehouses/${warehouseId}`);
        }
    }, [warehouseId, zoneId, addToast, navigate]);

    const fetchData = useCallback(async (currentFilters) => {
        setIsLoading(true);
        try {
            const response = await binService.getBins(zoneId, currentFilters);
            setBins(response.result.content);
            setTotalPages(response.result.totalPages);
        } catch (error) {
            addToast("Could not fetch bins. Please try again later.", "error");
            setBins([]);
        } finally {
            setIsLoading(false);
        }
    }, [addToast, zoneId]);

    // --- THÊM LẠI HÀM SUBMIT CHO MODAL ---
    const handleCreateBinSubmit = async (binData) => {
        try {
            await binService.createBin(zoneId, binData);
            addToast('Bin created successfully!', 'success');
            setIsCreateModalOpen(false);
            // Tải lại dữ liệu để hiển thị bin mới
            const currentFilters = { ...filters, keyword: debouncedKeyword };
            fetchData(currentFilters);
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to create bin.';
            addToast(message, 'error');
            // Ném lỗi để modal biết và hiển thị
            throw new Error(message);
        }
    };

    // --- 3. Thêm hàm xử lý submit cho update zone ---
    const handleUpdateZoneSubmit = async (zoneData) => {
        try {
            await zoneService.updateZone(warehouseId, zoneId, zoneData);
            addToast('Zone updated successfully!', 'success');
            setIsUpdateModalOpen(false);
            // Tải lại thông tin zone để hiển thị dữ liệu mới
            fetchZoneInfo();
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to update zone.';
            addToast(message, 'error');
            throw new Error(message); // Ném lỗi để modal biết và không tự đóng
        }
    };

    useEffect(() => {
        fetchZoneInfo();
    }, [fetchZoneInfo]);

    // --- Cập nhật dependencies cho useEffect ---
    useEffect(() => {
        const currentFilters = { ...filters, keyword: debouncedKeyword };
        fetchData(currentFilters);
    }, [debouncedKeyword, filters.updatedFrom, filters.updatedTo, filters.binType, filters.binStatus, filters.contentStatus, filters.page, filters.size, filters.sort, fetchData]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value, page: field === 'page' ? value : 0 }));
    };

    // --- THÊM LẠI HÀM BỊ THIẾU ---
    const handleRowDoubleClick = (bin) => {
        // Tạm thời chỉ hiển thị toast, sau này có thể điều hướng đến trang chi tiết
        addToast(`Double-clicked on bin: ${bin.bin_code}`, "info");
    };

    const handleResetFilters = () => {
        const currentViewSize = viewMode === 'list' ? listPageSizes[0] : cardPageSizes[0];
        setFilters({
            ...initialFiltersState,
            size: currentViewSize,
        });
    };

    const handleViewModeChange = (newMode) => {
        if (newMode === viewMode) return;
        setViewMode(newMode);
        const newSize = newMode === 'list' ? listPageSizes[0] : cardPageSizes[0];
        setFilters(prev => ({ ...prev, size: newSize, page: 0 }));
    };

    const isFilterActive = filters.keyword || filters.updatedFrom || filters.updatedTo || filters.binType || filters.binStatus || filters.contentStatus;

    // --- Thêm biến để chọn kích thước trang theo view mode ---
    const currentPageSizes = viewMode === 'list' ? listPageSizes : cardPageSizes;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">

                <div className="flex justify-between items-end">
                    {/* Cột bên trái: Thông tin Zone */}
                    <div>
                        <Link to={`/warehouses/${warehouseId}/zones`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-2">
                            <FaArrowLeft /> Back to Zones
                        </Link>
                        {zoneInfo ? (
                            <>
                                <h1 className="text-3xl text-left font-bold text-gray-800">{zoneInfo.zone_name}</h1>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                    <span className="font-mono bg-gray-200 px-2 py-0.5 rounded">{zoneInfo.zone_code}</span>
                                    <div className="flex items-center gap-1.5">
                                        <FaLayerGroup />
                                        <span>{zoneInfo.zone_type}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2 animate-pulse">
                                <div className="h-8 bg-gray-200 rounded w-64"></div>
                                <div className="h-5 bg-gray-200 rounded w-80"></div>
                            </div>
                        )}
                    </div>

                    {/* Cột bên phải: Các nút hành động (đã căn xuống thấp hơn) */}
                    <div className="flex items-end gap-4">
                        <Button
                            onClick={() => setIsUpdateModalOpen(true)}
                            variant="warning"
                            disabled={!zoneInfo}
                        >
                            <FaPencilAlt />
                            <span className="hidden sm:inline">Update Zone</span>
                        </Button>
                        <ViewModeToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
                    </div>
                </div>

                {/* Khu vực filter với nút Create Bin mới */}
                <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4 p-4 bg-white rounded-lg shadow-sm border">
                    <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
                        <input
                            type="text"
                            value={filters.keyword || ''}
                            onChange={e => handleFilterChange('keyword', e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            placeholder="By code or name..."
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Bin Type</label>
                        <select
                            value={filters.binType || ''}
                            onChange={e => handleFilterChange('binType', e.target.value)}
                            className="w-full p-2 border rounded-lg bg-white"
                        >
                            <option value="">All</option>
                            <option value="SHELF">Shelf</option>
                            <option value="PALLET">Pallet</option>
                            <option value="RACK">Rack</option>
                            <option value="FLOW_RACK">Flow Rack</option>
                            <option value="CARTON_FLOW">Carton Flow</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Content Status</label>
                        <select
                            value={filters.contentStatus || ''}
                            onChange={e => handleFilterChange('contentStatus', e.target.value)}
                            className="w-full p-2 border rounded-lg bg-white"
                        >
                            <option value="">All</option>
                            <option value="EMPTY">Empty</option>
                            <option value="PARTIAL">Partial</option>
                            <option value="FULL">Full</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Updated From</label>
                        <input
                            type="date"
                            value={filters.updatedFrom || ''}
                            onChange={e => handleFilterChange('updatedFrom', e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Updated To</label>
                        <input
                            type="date"
                            value={filters.updatedTo || ''}
                            onChange={e => handleFilterChange('updatedTo', e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>

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

                    {/* Nút Create Bin nằm cùng hàng filter */}
                    <div className="flex items-end">
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            variant="success"
                            className="w-full md:w-auto"
                        >
                            <FaPlus />
                            <span className="hidden sm:inline">Create Bin</span>
                        </Button>
                    </div>
                </div>

                {/* Hiển thị danh sách hoặc thẻ */}
                {viewMode === 'list' ? (
                    <BinListView
                        bins={bins}
                        isLoading={isLoading}
                        page={filters.page}
                        size={filters.size}
                        onRowDoubleClick={handleRowDoubleClick}
                    />
                ) : (
                    <BinCardView
                        bins={bins}
                        isLoading={isLoading}
                        onRowDoubleClick={handleRowDoubleClick}
                    />
                )}

                {/* --- Khu vực điều khiển phân trang và sắp xếp (giống ZoneListPage) --- */}
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
                            <option value="updateTimestamp,desc">Last Updated (Newest)</option>
                            <option value="updateTimestamp,asc">Last Updated (Oldest)</option>
                            <option value="binName,asc">Name (A-Z)</option>
                            <option value="binName,desc">Name (Z-A)</option>
                            <option value="creationTimestamp,desc">Created Date (Newest)</option>
                            <option value="creationTimestamp,asc">Created Date (Oldest)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Modal tạo bin */}
            <CreateBinModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateBinSubmit}
            />

            {/* --- 5. Render modal update zone --- */}
            {zoneInfo && (
                <UpdateZoneModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    onSubmit={handleUpdateZoneSubmit}
                    zoneData={zoneInfo}
                />
            )}
        </div>
    );
}