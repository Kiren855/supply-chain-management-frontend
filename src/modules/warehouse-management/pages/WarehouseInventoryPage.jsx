import { useParams } from 'react-router-dom';

export default function WarehouseInventoryPage() {
    const { warehouseId } = useParams();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Warehouse Inventory</h1>
            <p className="text-gray-600">Inventory details for Warehouse {warehouseId}</p>
            {/* Thêm table hoặc list inventory */}
            <div className="bg-white p-6 rounded-lg shadow">
                <p>Inventory table here...</p>
            </div>
        </div>
    );
}