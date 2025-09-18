import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaSearch } from 'react-icons/fa';

// Fix lỗi icon marker mặc định của Leaflet với React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component nội bộ để xử lý sự kiện click trên bản đồ
function LocationFinder({ onPositionChange }) {
    useMapEvents({
        click(e) {
            onPositionChange(e.latlng);
        },
    });
    return null;
}

// Component nội bộ để điều khiển bản đồ (di chuyển, zoom)
function MapController({ position }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(position, map.getZoom());
    }, [position, map]);
    return null;
}

export default function LocationPicker({ onLocationChange, initialData }) {
    // Sử dụng initialData để thiết lập vị trí ban đầu, nếu không có thì dùng mặc định
    const getInitialPosition = () => {
        if (initialData && initialData.latitude && initialData.longitude) {
            return [initialData.latitude, initialData.longitude];
        }
        return [10.7769, 106.7009]; // Vị trí mặc định (TP.HCM)
    };

    const [position, setPosition] = useState(getInitialPosition());
    const [address, setAddress] = useState(initialData?.address || 'Click on the map to select a location');
    const [searchQuery, setSearchQuery] = useState('');

    // Thêm useEffect để cập nhật bản đồ khi initialData thay đổi (quan trọng khi mở modal)
    useEffect(() => {
        if (initialData && initialData.latitude && initialData.longitude) {
            const newPos = [initialData.latitude, initialData.longitude];
            setPosition(newPos);
            setAddress(initialData.address || 'Location set from initial data');
        }
    }, [initialData]);

    // Hàm lấy địa chỉ từ tọa độ (Reverse Geocoding)
    const fetchAddress = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            const fullAddress = data.display_name || 'Could not find address';
            setAddress(fullAddress);
            onLocationChange({
                latitude: lat,
                longitude: lng,
                address: fullAddress,
            });
        } catch (error) {
            console.error("Error fetching address:", error);
            setAddress('Error fetching address');
        }
    };

    // Hàm tìm kiếm tọa độ từ địa chỉ (Forward Geocoding)
    const handleSearch = async () => { // Không cần 'e' nữa
        if (!searchQuery) return;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newPosition = [parseFloat(lat), parseFloat(lon)];
                setPosition(newPosition); // Cập nhật vị trí marker và di chuyển bản đồ
                fetchAddress(newPosition[0], newPosition[1]); // Cập nhật lại text địa chỉ
            } else {
                alert('Location not found.');
            }
        } catch (error) {
            console.error("Error searching location:", error);
            alert('Error searching for location.');
        }
    };

    // Hàm xử lý khi nhấn Enter trong ô tìm kiếm
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Ngăn hành vi mặc định của Enter (submit form ngoài)
            handleSearch();
        }
    };

    // Cập nhật vị trí khi click
    const handlePositionChange = (latlng) => {
        const newPosition = [latlng.lat, latlng.lng];
        setPosition(newPosition);
        fetchAddress(newPosition[0], newPosition[1]);
    };

    // Sử dụng useMemo để marker chỉ được tạo lại khi position thay đổi
    const displayMarker = useMemo(() => (
        <Marker position={position}></Marker>
    ), [position]);

    return (
        <div className="space-y-2">
            {/* Thay đổi <form> thành <div> */}
            <div className="flex gap-2">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown} // Thêm sự kiện onKeyDown
                        placeholder="Search for a location..."
                        className="w-full p-2 pl-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                {/* Thay đổi type="submit" thành type="button" và thêm onClick */}
                <button type="button" onClick={handleSearch} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
                    <FaSearch />
                </button>
            </div>

            <label className="block text-sm font-medium text-gray-700">Location</label>
            <div className="h-64 w-full rounded-lg overflow-hidden border">
                {/* Sửa lại thuộc tính center */}
                <MapContainer center={getInitialPosition()} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {displayMarker}
                    <LocationFinder onPositionChange={handlePositionChange} />
                    <MapController position={position} /> {/* Component điều khiển bản đồ */}
                </MapContainer>
            </div>
            <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-md">{address}</p>
        </div>
    );
}