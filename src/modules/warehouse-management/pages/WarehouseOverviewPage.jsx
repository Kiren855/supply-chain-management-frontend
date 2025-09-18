import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import warehouseService from "../service/warehouseService";
import { FaMapMarkerAlt, FaClock, FaSyncAlt, FaBarcode } from "react-icons/fa";
import Button from "@/components/common/Button";
import UpdateWarehouseModal from "../components/UpdateWarehouseModal";

// Tùy chỉnh icon cho marker trên bản đồ
const warehouseIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
    iconSize: [38, 38], // Icon lớn hơn một chút
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
});

// Helper định dạng ngày tháng
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function WarehouseOverviewPage() {
    const { warehouseId } = useParams();
    const [warehouse, setWarehouse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    const fetchWarehouse = async () => {
        try {
            const response = await warehouseService.getWarehouseById(warehouseId);
            setWarehouse(response.result);
        } catch (error) {
            console.error("Failed to fetch warehouse details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouse();
    }, [warehouseId]);

    const handleWarehouseUpdated = () => {
        // Tải lại thông tin kho sau khi cập nhật thành công
        fetchWarehouse();
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><p className="text-lg text-gray-500">Loading warehouse details...</p></div>;
    }

    if (!warehouse) {
        return <div className="flex justify-center items-center h-screen"><p className="text-lg text-red-500">Failed to load warehouse details.</p></div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">{warehouse.warehouse_name}</h1>
                        <div className="flex items-center gap-3 mt-2 text-slate-500">
                            <span className="font-mono text-sm bg-slate-200 px-2 py-1 rounded">
                                {warehouse.warehouse_code}
                            </span>
                            <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full ${warehouse.status === "ACTIVE"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                    }`}
                            >
                                {warehouse.status}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Button onClick={() => setIsUpdateModalOpen(true)} variant="warning">
                            Update Info
                        </Button>
                        <Button onClick={() => console.log("Change status")} variant="success">
                            Change Status
                        </Button>
                    </div>
                </header>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 gap-6">
                    {/* Left Column: Map */}
                    <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-md">
                        <MapContainer
                            key={`${warehouse.latitude}-${warehouse.longitude}`}
                            center={[warehouse.latitude, warehouse.longitude]}
                            zoom={16} // Zoom gần hơn một chút
                            scrollWheelZoom={true}
                            className="h-[400px] md:h-[600px] w-full rounded-lg z-0"
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker
                                position={[warehouse.latitude, warehouse.longitude]}
                                icon={warehouseIcon}
                            >
                                <Popup>
                                    <strong>{warehouse.warehouse_name}</strong>
                                    <br />
                                    {warehouse.location}
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>

                    {/* Right Column: Details Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
                            <h2 className="text-xl font-semibold text-slate-800 border-b pb-3">
                                Warehouse Information
                            </h2>

                            {/* Location */}
                            <div className="flex items-start gap-4">
                                <FaMapMarkerAlt className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500">Location</h3>
                                    <p className="text-base text-slate-800">{warehouse.location}</p>
                                </div>
                            </div>

                            {/* Divider */}
                            <hr />

                            {/* Timestamps */}
                            <div>
                                <h3 className="text-sm font-medium text-slate-500 mb-3">History</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <FaClock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-slate-700">Created At</p>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {formatDate(warehouse.create_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <FaSyncAlt className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-slate-700">Last Updated</p>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {formatDate(warehouse.update_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Update Warehouse */}
            <UpdateWarehouseModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                warehouseData={warehouse}
                onWarehouseUpdated={handleWarehouseUpdated}
            />
        </div>
    );
}