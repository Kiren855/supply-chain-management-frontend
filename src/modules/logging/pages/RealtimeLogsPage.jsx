import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import { jwtDecode } from 'jwt-decode';
import { FaCircle, FaFileCsv } from 'react-icons/fa';
import DatePicker from "react-datepicker";
import { tokenStore } from "@/core/utils/tokenStore";
import { refreshToken } from '@/core/api/refreshToken';
import logService from '@/modules/logging/service/logService';

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

// Helper để kiểm tra một ngày có phải là hôm nay không
const isToday = (someDate) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
};

const PAGE_SIZE = 100;

export default function RealtimeLogsPage() {
    const [logs, setLogs] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [selectedDate, setSelectedDate] = useState(new Date()); // State cho ngày được chọn
    const [isLoading, setIsLoading] = useState(false); // State cho trạng thái loading
    const [isLoadingOlder, setIsLoadingOlder] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isExporting, setIsExporting] = useState(false); // State cho nút export

    const clientRef = useRef(null);
    const isRetryingRef = useRef(false);
    const scrollContainerRef = useRef(null);
    const effectRan = useRef(false); // Thêm một ref để kiểm soát useEffect

    // BƯỚC 1: Gói toàn bộ logic kết nối vào một hàm
    // Bọc connectWebSocket trong useCallback
    const connectWebSocket = useCallback(async () => {
        if (clientRef.current?.active) {
            await clientRef.current.deactivate();
        }

        const companyId = getCompanyIdFromToken();
        const token = tokenStore.get();

        if (!companyId || !token) {
            setConnectionStatus('Error: Missing credentials.');
            return;
        }

        setConnectionStatus(isRetryingRef.current ? 'Reconnecting...' : 'Connecting...');

        const client = new Client({
            brokerURL: "ws://localhost:9000/logging/ws-logs",
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 0,
            onConnect: () => {
                setConnectionStatus('Connected');
                isRetryingRef.current = false;
                client.subscribe(`/topic/logs/${companyId}`, (message) => {
                    const rawLog = JSON.parse(message.body);
                    const newLog = {
                        username: rawLog.username,
                        activity: rawLog.activity,
                        creation_timestamp: rawLog.timestamp
                    };
                    // Dùng callback để đảm bảo an toàn khi cập nhật state
                    setLogs(prevLogs => [newLog, ...prevLogs]);
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
                    await refreshToken();
                    connectWebSocket();
                } catch (refreshError) {
                    setConnectionStatus('Fatal Error: Could not refresh token.');
                }
            },
            onStompError: (frame) => {
                console.error('STOMP Error:', frame.headers['message']);
                setConnectionStatus('Error');
            },
        });

        clientRef.current = client;
        client.activate();
    }, []); // Mảng phụ thuộc rỗng để đảm bảo hàm chỉ được tạo một lần

    const loadOlderLogs = useCallback(async () => {
        if (isLoadingOlder || !hasMore || logs.length === 0) return;

        setIsLoadingOlder(true);
        try {
            const lastLog = logs[logs.length - 1];
            const response = await logService.getOlderLogs(lastLog.creation_timestamp);
            const olderLogs = response.result || [];

            setLogs(prevLogs => [...prevLogs, ...olderLogs]);
            if (olderLogs.length < PAGE_SIZE) {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to fetch older logs:", error);
        } finally {
            setIsLoadingOlder(false);
        }
    }, [logs, isLoadingOlder, hasMore]);

    // --- USEEFFECT CHÍNH: Đã được cấu trúc lại ---
    useEffect(() => {
        // Chỉ chạy logic bên trong nếu đây là lần chạy thứ hai trong Strict Mode,
        // hoặc lần chạy duy nhất trong Production.
        if (effectRan.current === true || process.env.NODE_ENV !== 'development') {
            const loadHistoricalLogs = async () => {
                setIsLoading(true);
                setHasMore(true);
                setLogs([]);

                try {
                    const start = new Date(selectedDate);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(selectedDate);
                    end.setHours(23, 59, 59, 999);

                    const response = await logService.getLatestLogs(start, end);
                    const initialLogs = response.result || [];
                    setLogs(initialLogs);
                    if (initialLogs.length < PAGE_SIZE) {
                        setHasMore(false);
                    }
                } catch (error) {
                    console.error("Failed to fetch logs for date:", error);
                    setLogs([]);
                } finally {
                    setIsLoading(false);
                }
            };

            loadHistoricalLogs();

            let stompClient = null;
            if (isToday(selectedDate)) {
                connectWebSocket();
                stompClient = clientRef.current;
            }

            return () => {
                if (stompClient?.active) {
                    stompClient.deactivate();
                    setConnectionStatus('Disconnected');
                }
            };
        }

        // Đánh dấu rằng effect đã chạy một lần.
        return () => {
            effectRan.current = true;
        };
    }, [selectedDate, connectWebSocket]); // Dependency array giữ nguyên

    useEffect(() => {
        const container = scrollContainerRef.current;
        const handleScroll = () => {
            if (container) {
                const { scrollTop, scrollHeight, clientHeight } = container;
                if (scrollHeight - scrollTop - clientHeight < 100 && !isLoadingOlder) {
                    loadOlderLogs();
                }
            }
        };
        if (container) container.addEventListener('scroll', handleScroll);
        return () => {
            if (container) container.removeEventListener('scroll', handleScroll);
        };
    }, [loadOlderLogs]);

    // --- HÀM XỬ LÝ EXPORT ---
    const handleExport = async () => {
        setIsExporting(true);
        try {
            const start = new Date(selectedDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(selectedDate);
            end.setHours(23, 59, 59, 999);

            const blob = await logService.exportLogsToCsv(start, end);

            // Tạo một URL tạm thời cho blob
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;

            // Tạo tên file động theo ngày
            const dateString = start.toISOString().split('T')[0];
            link.setAttribute('download', `logs_${dateString}.csv`);

            // Thêm link vào trang, click và gỡ bỏ
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Failed to export logs:", error);
            // Có thể thêm thông báo lỗi cho người dùng ở đây
        } finally {
            setIsExporting(false);
        }
    };

    const statusColor = {
        'Connected': 'text-green-500',
        'Connecting...': 'text-yellow-500',
        'Reconnecting...': 'text-blue-500',
        'Authentication Failed. Refreshing token...': 'text-orange-500',
        'Fatal Error: Could not refresh token.': 'text-red-700',
        'Fatal Error: Could not connect after refresh.': 'text-red-700',
        'Disconnected': 'text-red-500',
        'Error': 'text-red-700',
        'Initializing...': 'text-gray-500',
        'Error: Missing credentials.': 'text-red-700',
    };

    return (
        // Sửa `h-full` thành `h-screen`
        <div className="flex flex-col h-screen space-y-6 p-6 bg-gray-50">
            {/* Phần Header: Không thay đổi */}
            <div className="flex justify-between items-center flex-shrink-0">
                <h1 className="text-3xl font-bold text-gray-800">Activity Logs</h1>
                <div className="flex items-center gap-4">
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="dd/MM/yyyy"
                        className="w-32 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        maxDate={new Date()}
                    />
                    {/* THÊM NÚT EXPORT */}
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                        <FaFileCsv />
                        {isExporting ? 'Exporting...' : 'Export CSV'}
                    </button>
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <FaCircle className={`w-3 h-3 ${statusColor[connectionStatus]}`} />
                        <span className="text-gray-600">{connectionStatus}</span>
                    </div>
                </div>
            </div>

            <div className="flex-grow relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div ref={scrollContainerRef} className="absolute inset-0 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-2/10">Timestamp</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/5">Username</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/2">Activity</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="text-center p-8 text-gray-500">
                                        Loading logs for {selectedDate.toLocaleDateString('vi-VN')}...
                                    </td>
                                </tr>
                            ) : logs.length > 0 ? (
                                logs.map((log, index) => (
                                    <tr key={`${log.creation_timestamp}-${index}`} className="hover:bg-blue-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-600 font-mono">
                                            {formatTimestamp(log.creation_timestamp)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-800 font-medium">
                                            {log.username}
                                        </td>
                                        <td className="px-6 py-4 text-left text-sm text-gray-700">
                                            {log.activity}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="text-center p-8 text-gray-500 italic">
                                        No activity logs found for {selectedDate.toLocaleDateString('vi-VN')}.
                                    </td>
                                </tr>
                            )}
                            {isLoadingOlder && (
                                <tr>
                                    <td colSpan={3} className="text-center p-4 text-gray-500">
                                        Loading more...
                                    </td>
                                </tr>
                            )}
                            {!hasMore && logs.length > 0 && !isLoading && (
                                <tr>
                                    <td colSpan={3} className="text-center p-4 text-gray-400 italic">
                                        No more logs to load.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}