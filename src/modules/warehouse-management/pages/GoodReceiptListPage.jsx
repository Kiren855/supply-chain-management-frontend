import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import warehouseService from "../service/warehouseService";
import Pagination from "@/components/common/Pagination";
import Button from "@/components/common/Button";
import GoodReceiptDetailModal from "../components/GoodReceiptDetailModal";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useToast } from "@/contexts/ToastContext";
import { FaSearch, FaEye, FaPlus, FaBan } from "react-icons/fa";

const SOURCE_TYPES = [
    { value: "", label: "All Sources" },
    { value: "PURCHASE_ORDER", label: "Purchase Order" },
    { value: "PRODUCTION", label: "Production" },
    { value: "TRANSFER", label: "Transfer" },
    { value: "RETURN", label: "Return" },
];

const RECEIPT_STATUS = [
    { value: "", label: "All Status" },
    { value: "PENDING", label: "Pending" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "COMPLETED", label: "Completed" },
];

const listPageSizes = [10, 20, 50];

function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

const formatDate = (iso) => {
    if (!iso) return "N/A";
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
};

export default function GoodReceiptListPage({ defaultReceiptStatus = "PENDING" }) {
    const { warehouseId } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        keyword: "",
        sourceType: "",
        receiptStatus: "", // added status filter
        page: 0,
        size: listPageSizes[0],
    });
    const debouncedKeyword = useDebounce(filters.keyword, 700);

    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [error, setError] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedReceiptId, setSelectedReceiptId] = useState(null);
    const [selectedReceiptNumber, setSelectedReceiptNumber] = useState(null);

    // selection
    const [selectedReceipts, setSelectedReceipts] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // IDs of receipts that are selectable (status PENDING)
    const pendingReceiptIds = receipts
        .filter(r => ((r.receipt_status ?? r.receiptStatus ?? "").toString().toUpperCase()) === "PENDING")
        .map(r => r.receipt_id ?? r.receiptId ?? r.id)
        .filter(Boolean);


    // confirmation modal state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    // cancel single receipt state
    const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
    const [cancelReceiptId, setCancelReceiptId] = useState(null);
    const [cancelReceiptNumber, setCancelReceiptNumber] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const fetchReceipts = async (f = filters) => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: f.page,
                size: f.size,
            };
            if (f.keyword && f.keyword.trim()) params.keyword = f.keyword.trim();
            if (f.sourceType) params.sourceType = f.sourceType;
            if (f.receiptStatus) params.receiptStatus = f.receiptStatus; // send status to backend

            const res = await warehouseService.getGoodReceipts(warehouseId, params);
            const result = res.result || {};
            const list = result.content || [];
            setReceipts(list);
            setTotalPages(result.totalPages ?? 1);
            setTotalElements(result.totalElements ?? 0);
            setFilters(prev => ({ ...prev, page: result.pageNumber ?? prev.page, size: result.pageSize ?? prev.size }));

            // reset selection on new data
            setSelectedReceipts([]);
            setSelectAll(false);
        } catch (err) {
            console.error("getGoodReceipts error", err);
            setError("Failed to load good receipts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const f = { ...filters, keyword: debouncedKeyword };
        fetchReceipts(f);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [warehouseId, debouncedKeyword, filters.sourceType, filters.receiptStatus, filters.page, filters.size]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
            page: field === "page" ? value : 0, // reset page on filter change
        }));
    };

    const handleResetFilters = () => {
        setFilters({
            keyword: "",
            sourceType: "",
            receiptStatus: "",
            page: 0,
            size: listPageSizes[0],
        });
    };

    const handleSearchNow = () => {
        fetchReceipts({ ...filters, keyword: filters.keyword, page: 0 });
    };

    const openDetail = (r) => {
        setSelectedReceiptId(r.receipt_id ?? r.receiptId ?? r.id ?? null);
        setSelectedReceiptNumber(r.receipt_number ?? null);
        setDetailModalOpen(true);
    };

    const toggleSelectOne = (e, r) => {
        e.stopPropagation();
        const status = (r.receipt_status ?? r.receiptStatus ?? "").toString().toUpperCase();
        if (status !== "PENDING") return; // only pending can be selected
        const id = r.receipt_id ?? r.receiptId ?? r.id;
        if (!id) return;
        setSelectedReceipts(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id);
            return [...prev, id];
        });
    };

    const toggleSelectAll = (e) => {
        e.stopPropagation();
        const checked = e.target.checked;
        setSelectAll(checked);
        if (checked) {
            // select only pending receipts
            setSelectedReceipts(pendingReceiptIds);
        } else {
            setSelectedReceipts([]);
        }
    };

    // open confirmation modal
    const handleGroupConfirm = () => {
        if (!selectedReceipts || selectedReceipts.length === 0) {
            addToast("Chọn ít nhất một receipt để nhóm.", "error");
            return;
        }
        setConfirmOpen(true);
    };

    const onConfirmGroup = async () => {
        setIsConfirming(true);
        try {
            await warehouseService.processGroupReceipts(warehouseId, { receipt_ids: selectedReceipts });
            addToast("Group receipt created successfully.", "success");
            setConfirmOpen(false);
            // refresh list
            fetchReceipts({ ...filters, page: 0 });
        } catch (err) {
            console.error("processGroupReceipts error", err);
            const msg = err?.response?.data?.message ?? "Failed to group receipts.";
            addToast(msg, "error");
        } finally {
            setIsConfirming(false);
        }
    };

    const openCancelConfirm = (r) => {
        setCancelReceiptId(r.receipt_id ?? r.receiptId ?? r.id ?? null);
        setCancelReceiptNumber(r.receipt_number ?? r.receiptNumber ?? "-");
        setCancelConfirmOpen(true);
    };

    const onConfirmCancel = async () => {
        if (!cancelReceiptId) return;
        setIsCancelling(true);
        try {
            await warehouseService.cancelGoodReceipt(warehouseId, cancelReceiptId);
            addToast("Receipt cancelled successfully.", "success");
            setCancelConfirmOpen(false);
            // refresh list
            fetchReceipts({ ...filters, page: 0 });
        } catch (err) {
            const msg = err?.response?.data?.message ?? "Failed to cancel receipt.";
            addToast(msg, "error");
        } finally {
            setIsCancelling(false);
            setCancelReceiptId(null);
            setCancelReceiptNumber(null);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Good Receipts</h1>
                </div>

                {/* Buttons on top of filters */}
                <div className="w-full flex justify-end gap-2 mb-3">
                    <Button onClick={handleGroupConfirm} variant="success" className="px-3" disabled={selectedReceipts.length === 0 || isConfirming}>
                        Group Confirm
                    </Button>
                    <Button onClick={() => navigate(`/warehouses/${warehouseId}/good-receipts/create`)} variant="info">
                        <FaPlus /> Create
                    </Button>
                </div>

                {/* Filters block */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-11 gap-4 p-4 bg-white rounded-lg shadow-sm border">
                    {/* Search Input */}
                    <div className="lg:col-span-6">
                        <label htmlFor="search-keyword" className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                id="search-keyword"
                                type="text"
                                placeholder="By receipt number..."
                                value={filters.keyword}
                                onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value, page: 0 }))}
                                onKeyDown={(e) => e.key === "Enter" && handleSearchNow()}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        </div>
                    </div>

                    {/* Source Type */}
                    <div className="lg:col-span-3">
                        <label htmlFor="source-type" className="text-sm font-medium text-gray-700 mb-1 block">Source Type</label>
                        <select
                            id="source-type"
                            value={filters.sourceType}
                            onChange={(e) => handleFilterChange('sourceType', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        >
                            {SOURCE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>

                    {/* Receipt Status */}
                    <div className="lg:col-span-2">
                        <label htmlFor="receipt-status" className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                        <select
                            id="receipt-status"
                            value={filters.receiptStatus}
                            onChange={(e) => handleFilterChange('receiptStatus', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        >
                            {RECEIPT_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 table-fixed">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-10">
                                        <input
                                            type="checkbox"
                                            checked={pendingReceiptIds.length > 0 && pendingReceiptIds.every(id => selectedReceipts.includes(id))}
                                            onChange={toggleSelectAll}
                                            disabled={pendingReceiptIds.length === 0}
                                            aria-label="select all pending"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-12">#</th>
                                    {/* reduce receipt number width to free space for Created/Updated */}
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-28">Receipt Number</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-36">Source</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-36">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-28">Items</th>
                                    {/* increase Created/Updated widths */}
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-44">Created At</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-44">Updated At</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase w-36">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    Array.from({ length: filters.size }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-4" /></td>
                                            <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-6" /></td>
                                            <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-36" /></td>
                                            <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-30" /></td>
                                            <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-30" /></td>
                                            <td className="px-4 py-4 text-right"><div className="h-4 bg-gray-200 rounded w-10 mx-auto" /></td>
                                            <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                                            <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                                            <td className="px-4 py-4 text-center"><div className="h-8 bg-gray-200 rounded w-10 mx-auto" /></td>
                                        </tr>
                                    ))
                                ) : receipts.length > 0 ? (
                                    receipts.map((r, idx) => {
                                        const id = r.receipt_id ?? r.receiptId ?? r.id;
                                        const checked = selectedReceipts.includes(id);
                                        return (
                                            <tr key={id ?? r.receipt_number ?? idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    {((r.receipt_status ?? r.receiptStatus ?? "").toString().toUpperCase()) === "PENDING" ? (
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={(e) => toggleSelectOne(e, r)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    ) : (
                                                        <input
                                                            type="checkbox"
                                                            checked={false}
                                                            disabled
                                                            className="opacity-50 cursor-not-allowed"
                                                            aria-label="not selectable"
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{filters.page * filters.size + idx + 1}</td>
                                                <td className="px-4 py-3 text-left text-sm text-gray-800 font-medium truncate">{r.receipt_number}</td>
                                                <td className="px-4 py-3 text-left text-sm text-gray-700">{r.source_type}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`inline-flex text-left items-center px-2 py-1 text-xs font-semibold rounded-full ${r.receipt_status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                                                        r.receipt_status === "COMPLETED" ? "bg-green-100 text-green-800" :
                                                            "bg-gray-100 text-gray-800"
                                                        }`}>{r.receipt_status}</span>
                                                </td>
                                                <td className="px-4 py-3 text-left text-sm text-gray-700 font-mono">{r.total_item}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 w-44">{formatDate(r.create_at)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 w-44">{formatDate(r.update_at)}</td>
                                                <td className="px-4 py-3 text-center whitespace-nowrap">
                                                    <div className="inline-flex items-center gap-2 justify-center whitespace-nowrap">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); openDetail(r); }}
                                                            className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 whitespace-nowrap"
                                                            title="View"
                                                        >
                                                            <FaEye />
                                                        </button>
                                                        {((r.receipt_status ?? r.receiptStatus ?? "").toString().toUpperCase()) === "PENDING" && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); openCancelConfirm(r); }}
                                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm bg-red-50 text-red-700 hover:bg-red-100 whitespace-nowrap"
                                                                title="Cancel"
                                                            >
                                                                <FaBan />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-8 text-center text-gray-500">No good receipts found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <label className="text-gray-700 font-medium">Items per page:</label>
                        <select
                            value={filters.size}
                            onChange={(e) => handleFilterChange('size', Number(e.target.value))}
                            className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            {listPageSizes.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="text-sm text-gray-500">Total: {totalElements}</div>
                    </div>

                    <div>
                        {totalPages > 1 && (
                            <Pagination currentPage={filters.page} totalPages={totalPages} onPageChange={(p) => handleFilterChange('page', p)} />
                        )}
                    </div>
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                {/* Detail modal */}
                <GoodReceiptDetailModal
                    isOpen={detailModalOpen}
                    onClose={() => setDetailModalOpen(false)}
                    warehouseId={warehouseId}
                    receiptId={selectedReceiptId}
                    receiptNumber={selectedReceiptNumber}
                />

                <ConfirmationModal
                    isOpen={confirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    onConfirm={onConfirmGroup}
                    title="Confirm group receipts"
                    message={`Group ${selectedReceipts.length} receipt(s) into one group receipt?`}
                    confirmText="Confirm"
                    isConfirming={isConfirming}
                />

                <ConfirmationModal
                    isOpen={cancelConfirmOpen}
                    onClose={() => { setCancelConfirmOpen(false); setCancelReceiptId(null); setCancelReceiptNumber(null); }}
                    onConfirm={onConfirmCancel}
                    title="Confirm cancel receipt"
                    message={`Are you sure you want to cancel receipt ${cancelReceiptNumber}?`}
                    confirmText="Cancel"
                    isConfirming={isCancelling}
                />
            </div>
        </div>
    );
}