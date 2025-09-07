import { useState, useEffect } from "react";
import authService from "@/modules/auth/services/authService"; // Sửa: import authService
import { useToast } from "@/contexts/ToastContext";
import { FaTimes } from "react-icons/fa";

export default function ChangePasswordModal({ isOpen, onClose, userId }) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    // Reset form khi modal được mở hoặc đóng
    useEffect(() => {
        if (!isOpen) {
            setPassword("");
            setConfirmPassword("");
            setErrors({});
            setLoading(false);
        }
    }, [isOpen]);

    const validate = () => {
        const newErrors = {};
        if (password.length < 8 || password.length > 50) {
            newErrors.password = "Password must be between 8 and 50 characters.";
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});
        setLoading(true);
        try {
            // Sửa: Gọi đúng hàm từ authService
            await authService.changeSubPassword(userId, password);
            addToast('Password changed successfully!', 'success');
            onClose(); // Đóng modal khi thành công
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to change password.";
            addToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.25)] flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}