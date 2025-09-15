import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix lỗi icon marker mặc định của Leaflet với React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component nội bộ để xử lý sự kiện trên bản đồ
function LocationFinder({ onPositionChange }) {
    useMapEvents({
        click(e) {
            onPositionChange(e.latlng);
        },
    });
    return null;
}

export default function LocationPicker({ onLocationChange }) {
    // Vị trí mặc định khi mở bản đồ (ví dụ: trung tâm TP.HCM)
    const initialPosition = [10.7769, 106.7009];
    const [position, setPosition] = useState(initialPosition);
    const [address, setAddress] = useState('Click on the map to select a location');

    // Hàm gọi API để lấy địa chỉ từ tọa độ (Reverse Geocoding)
    const fetchAddress = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            const fullAddress = data.display_name || 'Could not find address';
            setAddress(fullAddress);
            // Gửi thông tin vị trí đầy đủ về cho component cha
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

    // Cập nhật vị trí và fetch địa chỉ mới
    const handlePositionChange = (latlng) => {
        setPosition([latlng.lat, latlng.lng]);
        fetchAddress(latlng.lat, latlng.lng);
    };

    // Sử dụng useMemo để marker chỉ được tạo lại khi position thay đổi
    const displayMarker = useMemo(() => (
        <Marker position={position}></Marker>
    ), [position]);

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <div className="h-64 w-full rounded-lg overflow-hidden border">
                <MapContainer center={initialPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {displayMarker}
                    <LocationFinder onPositionChange={handlePositionChange} />
                </MapContainer>
            </div>
            <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-md">{address}</p>
        </div>
    );
}