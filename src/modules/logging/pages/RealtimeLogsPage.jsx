import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { jwtDecode } from 'jwt-decode';
import { FaCircle } from 'react-icons/fa';
import { tokenStore } from "@/core/utils/tokenStore";
import { refreshToken } from '@/core/api/refreshToken'; // Import hàm refreshToken

const getCompanyIdFromToken = () => {
    try {
        const token = tokenStore.get();
        if (!token) return null;
        const decodedToken = jwtDecode(token);
        return decodedToken.company_id;
    } catch (error) {
        console.error("Failed to decode token or find company_id:", error);
        return null;
    }
};

const formatTimestamp = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('vi-VN', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
};

export default function RealtimeLogsPage() {
    const [logs, setLogs] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('Initializing...');
    const isRetryingRef = useRef(false); // Khởi tạo useRef để theo dõi trạng thái retry

    useEffect(() => {
        const companyId = getCompanyIdFromToken();
        const token = tokenStore.get();

        if (!companyId || !token) {
            setConnectionStatus('Error: Missing credentials.');
            return;
        }

        const client = new Client({
            brokerURL: "ws://localhost:9000/logging/ws-logs",
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 0,
            onConnect: () => {
                setConnectionStatus('Connected');
                client.subscribe(`/topic/logs/${companyId}`, (message) => {
                    const newLog = JSON.parse(message.body);
                    setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 99)]);
                });
            },
            onWebSocketError: async (error) => {
                console.error("WebSocket Handshake Error:", error);
                if (isRetryingRef.current) {
                    setConnectionStatus('Fatal Error: Could not connect after refresh.');
                    return;
                }

                setConnectionStatus('Authentication Failed. Refreshing token...');
                isRetryingRef.current = true;
                try {
                    await refreshToken(); // Gọi hàm tập trung
                    connectWebSocket(); // Thử kết nối lại
                } catch (refreshError) {
                    setConnectionStatus('Fatal Error: Could not refresh token.');
                }
            },

            onStompError: (frame) => {
                console.error('STOMP Error:', frame.headers['message'], frame.body);
                setConnectionStatus('Error');
            },
            onDisconnect: () => {
                setConnectionStatus('Disconnected');
            }
        });

        setConnectionStatus('Connecting...');
        client.activate();

        return () => {
            client.deactivate();
        };
    }, []); // useEffect chỉ chạy một lần

    const statusColor = {
        'Connected': 'text-green-500',
        'Connecting...': 'text-yellow-500',
        'Disconnected': 'text-red-500',
        'Error': 'text-red-700',
        'Initializing...': 'text-gray-500',
        'Error: Missing credentials.': 'text-red-700',
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Real-time Activity Logs</h1>
                <div className="flex items-center gap-2 text-sm font-medium">
                    <FaCircle className={`w-3 h-3 ${statusColor[connectionStatus]}`} />
                    <span className="text-gray-600">{connectionStatus}</span>
                </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">Timestamp</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/2">Activity</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {logs.length > 0 ? (
                            logs.map((log, index) => (
                                <tr key={`${log.timestamp}-${index}`} className="hover:bg-blue-50 transition animate-fade-in">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                                        {formatTimestamp(log.timestamp)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                                        {log.username}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {log.activity}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-500 italic">
                                    Waiting for new activity logs...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}