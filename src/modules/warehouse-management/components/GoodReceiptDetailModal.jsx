import { useEffect, useState } from "react";
import Button from "@/components/common/Button";
import Pagination from "@/components/common/Pagination";
import { FaTimes } from "react-icons/fa";
import warehouseService from "../service/warehouseService";
import productService from "@/modules/product-catalog/service/productService";

export default function GoodReceiptDetailModal({ isOpen, onClose, warehouseId, receiptId, receiptNumber }) {
    const [loading, setLoading] = useState(false);
    const [receipt, setReceipt] = useState(null);

    // packages pagination state
    const [packages, setPackages] = useState([]);
    const [pkgLoading, setPkgLoading] = useState(false);
    const [pkgPage, setPkgPage] = useState(0);
    const [pkgSize, setPkgSize] = useState(10);
    const [pkgTotalPages, setPkgTotalPages] = useState(1);
    const [pkgTotalElements, setPkgTotalElements] = useState(0);

    const [error, setError] = useState(null);
    const [packageIds, setPackageIds] = useState([]);

    // fetch receipt and initial package ids
    useEffect(() => {
        if (!isOpen) return;
        const fetchDetail = async () => {
            setLoading(true);
            setError(null);
            setReceipt(null);
            setPackages([]);
            setPackageIds([]);
            setPkgPage(0);
            try {
                const res = await warehouseService.getGoodReceiptById(warehouseId, receiptId ?? receiptNumber);
                const rec = res.result ?? res;
                setReceipt(rec);

                const ids = (rec.items || []).map(i => i.product_package_id).filter(Boolean);
                setPackageIds(ids);
            } catch (err) {
                console.error(err);
                setError("Failed to load receipt detail.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, warehouseId, receiptId, receiptNumber]);

    // fetch packages (paginated) when packageIds or page/size change
    useEffect(() => {
        if (!isOpen) return;
        if (!packageIds || packageIds.length === 0) {
            setPackages([]);
            setPkgTotalPages(1);
            setPkgTotalElements(0);
            return;
        }

        const fetchPackages = async () => {
            setPkgLoading(true);
            try {
                // productService.getPackagesByIds should POST body { package_ids } and accept page/size as params
                const res = await productService.getPackagesByIds(packageIds, pkgPage, pkgSize);
                const result = res.result ?? res;
                const content = result.content ?? result;
                setPackages(Array.isArray(content) ? content : []);
                setPkgPage(result.pageNumber ?? pkgPage);
                setPkgSize(result.pageSize ?? pkgSize);
                setPkgTotalPages(result.totalPages ?? 1);
                setPkgTotalElements(result.totalElements ?? (Array.isArray(content) ? content.length : 0));
            } catch (err) {
                console.error("fetchPackages error", err);
                setError("Failed to load package details.");
            } finally {
                setPkgLoading(false);
            }
        };

        fetchPackages();
    }, [isOpen, packageIds, pkgPage, pkgSize]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-lg z-60 overflow-auto max-h-[80vh]">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">Good Receipt Detail</h3>
                    <div className="flex items-center gap-2">
                        <Button onClick={onClose} variant="ghost" className="p-2">
                            <FaTimes />
                        </Button>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {loading ? (
                        <div className="text-center text-gray-500">Loading receipt...</div>
                    ) : error ? (
                        <div className="text-red-500 text-sm">{error}</div>
                    ) : !receipt ? (
                        <div className="text-gray-500 text-sm">No data</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-gray-500">Receipt Number</div>
                                    <div className="text-lg font-medium text-gray-800">{receipt.receipt_number}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Status</div>
                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold mt-1 ${receipt.receipt_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                        receipt.receipt_status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                            receipt.receipt_status === 'RECEIVED' ? 'bg-blue-100 text-blue-800' :
                                                receipt.receipt_status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                        {receipt.receipt_status}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Source</div>
                                    <div className="text-sm text-gray-800 font-medium mt-1">{receipt.source_type}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Total Items</div>
                                    <div className="text-sm text-gray-800 font-mono mt-1">{receipt.total_item}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Created At</div>
                                    <div className="text-sm text-gray-800 mt-1">{new Date(receipt.create_at).toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Updated At</div>
                                    <div className="text-sm text-gray-800 mt-1">{new Date(receipt.update_at).toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <h4 className="text-md font-semibold mb-3">Items</h4>

                                <div className="bg-white border rounded-md">
                                    {pkgLoading ? (
                                        <div className="p-4 text-center text-gray-500">Loading packages...</div>
                                    ) : packages.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">No packages found.</div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 table-fixed">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-12">#</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Barcode</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-28">Type</th>
                                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase w-48">Dimensions (L×W×H)</th>
                                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase w-24">Weight</th>
                                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase w-20">Qty</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-100">
                                                    {packages.map((pkg, index) => {
                                                        const qtyObj = (receipt.items || []).find(i => i.product_package_id === (pkg.package_id ?? pkg.id));
                                                        const qty = qtyObj?.package_quantity ?? 0;
                                                        return (
                                                            <tr key={pkg.package_id ?? pkg.id} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 text-sm text-gray-600">{pkgPage * pkgSize + index + 1}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-800 font-mono">{pkg.barcode ?? "-"}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-800">
                                                                    <div className="font-medium">{pkg.product_name ?? "-"}</div>
                                                                    <div className="text-xs text-gray-500 font-mono">{pkg.product_sku ?? ""}</div>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-700">{pkg.package_type ?? "-"}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-700 text-right">{`${pkg.length ?? "-"} x ${pkg.width ?? "-"} x ${pkg.height ?? "-"}`}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-700 text-right">{pkg.weight ?? "-"}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-700 text-right font-semibold">{qty}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {/* pagination controls for packages */}
                                <div className="mt-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <label className="text-sm text-gray-600">Items per page:</label>
                                        <select
                                            value={pkgSize}
                                            onChange={(e) => { setPkgSize(Number(e.target.value)); setPkgPage(0); }}
                                            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                                        >
                                            {[5, 10, 20].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <div className="text-sm text-gray-500">Total: {pkgTotalElements}</div>
                                    </div>

                                    <div>
                                        {pkgTotalPages > 1 && (
                                            <Pagination currentPage={pkgPage} totalPages={pkgTotalPages} onPageChange={(p) => setPkgPage(p)} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end gap-2 p-4 border-t">
                    <Button onClick={onClose} variant="secondary">Close</Button>
                </div>
            </div>
        </div>
    );
}