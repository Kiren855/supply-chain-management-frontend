import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import warehouseService from "../service/warehouseService";
import Pagination from "@/components/common/Pagination";
import Button from "@/components/common/Button";
import { FaSearch } from "react-icons/fa";
import { FaBan, FaDownload } from "react-icons/fa";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useToast } from "@/contexts/ToastContext";

function useDebounce(value, delay = 700) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

const formatDate = (iso) => {
    if (!iso) return "-";
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
};

export default function GroupReceiptListView({ defaultStatus = null }) {
    const { warehouseId } = useParams();
    const { addToast } = useToast();
    const [downloadingGroupId, setDownloadingGroupId] = useState(null);
    const [items, setItems] = useState([]);
    // cancel group states
    const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
    const [cancelGroupId, setCancelGroupId] = useState(null);
    const [cancelGroupCode, setCancelGroupCode] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState("");
    const debouncedKeyword = useDebounce(keyword);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [error, setError] = useState(null);

    const downloadPutaway = async (g) => {
        const id = g.id ?? g.group_id ?? g.groupId;
        if (!id) return;
        setDownloadingGroupId(id);
        try {
            const data = await warehouseService.downloadGroupReceiptPutaway(id);
            const blob = new Blob([data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `putaway_instructions_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            addToast("Download started.", "success");
        } catch (err) {
            console.error("downloadGroupReceiptPutaway error", err);
            const msg = err?.response?.data?.message ?? "Failed to download putaway file.";
            addToast(msg, "error");
        } finally {
            setDownloadingGroupId(null);
        }
    };

    const fetch = async (p = page, s = size, q = debouncedKeyword) => {
        setLoading(true);
        setError(null);
        try {
            const params = { page: p, size: s };
            if (q && q.trim()) params.keyword = q.trim();
            if (defaultStatus) params.status = defaultStatus;
            const res = await warehouseService.getGroupReceipts(warehouseId, params);
            const result = res.result ?? {};
            setItems(result.content ?? []);
            setPage(result.pageNumber ?? 0);
            setSize(result.pageSize ?? s);
            setTotalPages(result.totalPages ?? 1);
            setTotalElements(result.totalElements ?? 0);
        } catch (err) {
            console.error("getGroupReceipts error", err);
            setError("Failed to load group receipts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(0);
        fetch(0, size, debouncedKeyword);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedKeyword, defaultStatus, warehouseId, size]);

    const handlePageChange = (p) => {
        setPage(p);
        fetch(p, size, debouncedKeyword);
    };

    const handleSizeChange = (s) => {
        setSize(s);
        setPage(0);
        fetch(0, s, debouncedKeyword);
    };

    const handleSearchNow = () => {
        setPage(0);
        fetch(0, size, keyword);
    };

    const handleResetFilters = () => {
        setKeyword("");
        setPage(0);
        fetch(0, size, "");
    };

    const openCancelConfirm = (g) => {
        setCancelGroupId(g.id ?? g.group_id ?? g.groupId ?? null);
        setCancelGroupCode(g.group_code ?? g.groupCode ?? "-");
        setCancelConfirmOpen(true);
    };

    const onConfirmCancel = async () => {
        if (!cancelGroupId) return;
        setIsCancelling(true);
        try {
            await warehouseService.cancelGroupReceipt(warehouseId, cancelGroupId);
            addToast("Group receipt cancelled.", "success");
            setCancelConfirmOpen(false);
            // refresh list
            fetch(0, size, debouncedKeyword);
        } catch (err) {
            console.error("cancelGroupReceipt error", err);
            const msg = err?.response?.data?.message ?? "Failed to cancel group receipt.";
            addToast(msg, "error");
        } finally {
            setIsCancelling(false);
            setCancelGroupId(null);
            setCancelGroupCode(null);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Group Receipts</h1>
                <div className="text-sm text-gray-600">Total: {totalElements}</div>
            </div>

            {/* Filters block */}
            <div className="relative grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 p-4 bg-white rounded-lg shadow-sm border">
                <div className="relative lg:col-span-3">
                    <label htmlFor="search-keyword" className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
                    <FaSearch className="absolute left-3 bottom-3 text-gray-400" />
                    <input
                        id="search-keyword"
                        type="text"
                        placeholder="By group code or keyword..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearchNow()}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>

                <div />
                <div />


            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full table-fixed divide-y divide-gray-200">
                        {/* first column fixed small, remaining 5 columns equal */}
                        <colgroup>
                            <col style={{ width: 48 }} /> {/* "#" column fixed 48px */}
                            <col style={{ width: 'calc((100% - 48px) / 5)' }} />
                            <col style={{ width: 'calc((100% - 48px) / 5)' }} />
                            <col style={{ width: 'calc((100% - 48px) / 5)' }} />
                            <col style={{ width: 'calc((100% - 48px) / 5)' }} />
                            <col style={{ width: 'calc((100% - 48px) / 5)' }} />
                        </colgroup>

                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Group Code</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total Receipts</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Created At</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                Array.from({ length: size }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-6" /></td>
                                        <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-48" /></td>
                                        <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                                        <td className="px-4 py-4 text-right"><div className="h-4 bg-gray-200 rounded w-10 mx-auto" /></td>
                                        <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                                        <td className="px-4 py-4 text-center"><div className="h-8 bg-gray-200 rounded w-10 mx-auto" /></td>
                                    </tr>
                                ))
                            ) : items.length > 0 ? (
                                items.map((g, idx) => (
                                    <tr key={g.group_code ?? g.groupCode ?? idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-600 text-left">{page * size + idx + 1}</td>
                                        <td className="px-4 py-3 text-left text-sm text-gray-800 font-medium truncate">{g.group_code ?? g.groupCode ?? "-"}</td>
                                        <td className="px-4 py-3 text-left text-sm">
                                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${(
                                                (g.status ?? "").toUpperCase().startsWith("CONFIRM")) ? "bg-yellow-100 text-yellow-800" :
                                                (g.status ?? "").toUpperCase() === "COMPLETED" ? "bg-green-100 text-green-800" :
                                                    "bg-gray-100 text-gray-800"}`}>
                                                {g.status ?? "-"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700 text-left font-mono">{g.total_receipts ?? g.totalReceipts ?? 0}</td>
                                        <td className="px-4 py-3 text-left text-sm text-gray-600">{formatDate(g.created_at ?? g.create_at)}</td>
                                        <td className="px-4 py-3 text-left">
                                            <div className="inline-flex items-center gap-2 justify-center whitespace-nowrap">
                                                {((g.status ?? "").toString().toUpperCase().startsWith("CONFIRM")) && (
                                                    <>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); openCancelConfirm(g); }}
                                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm bg-red-50 text-red-700 hover:bg-red-100"
                                                            title="Cancel group"
                                                        >
                                                            <FaBan />
                                                        </button>

                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); downloadPutaway(g); }}
                                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm bg-green-50 text-green-700 hover:bg-green-100"
                                                            title="Download putaway"
                                                            disabled={downloadingGroupId === (g.id ?? g.group_id ?? g.groupId)}
                                                        >
                                                            <FaDownload />
                                                            {downloadingGroupId === (g.id ?? g.group_id ?? g.groupId) ? (
                                                                <span className="ml-1 text-xs">...</span>
                                                            ) : null}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No group receipts found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <label className="text-gray-700 font-medium">Items per page:</label>
                    <select value={size} onChange={(e) => handleSizeChange(Number(e.target.value))} className="border rounded px-2 py-1">
                        {[10, 20, 50].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="text-sm text-gray-500">Total: {totalElements}</div>
                </div>

                <div>
                    {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />}
                </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <ConfirmationModal
                isOpen={cancelConfirmOpen}
                onClose={() => { setCancelConfirmOpen(false); setCancelGroupId(null); setCancelGroupCode(null); }}
                onConfirm={onConfirmCancel}
                title="Confirm cancel group receipt"
                message={`Are you sure you want to cancel group ${cancelGroupCode}?`}
                confirmText="Confirm"
                isConfirming={isCancelling}
            />
        </div>
    );
}