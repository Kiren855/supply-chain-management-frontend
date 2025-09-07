import { createContext, useState, useContext, useCallback } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

        // Tự động xóa toast sau 3 giây
        setTimeout(() => {
            setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
                {toasts.map((toast) => (
                    <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

// Hook để sử dụng toast một cách tiện lợi
export const useToast = () => {
    return useContext(ToastContext);
};

// Component cho từng thông báo
function Toast({ message, type, onClose }) {
    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
    const Icon = isSuccess ? FaCheckCircle : FaTimesCircle;

    return (
        <div className={`flex items-center text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in-right ${bgColor}`}>
            <Icon className="mr-3" size={20} />
            <span>{message}</span>
        </div>
    );
}