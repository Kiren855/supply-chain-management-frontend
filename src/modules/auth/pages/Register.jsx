import { useState } from "react";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";
import { UserIcon, EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export default function Register() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validateForm = () => {
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setMessage("Please enter a valid email address.");
            return false;
        }
        if (formData.password.length < 8) {
            setMessage("Password must be at least 8 characters.");
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setMessage("Passwords do not match.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!validateForm()) return;

        setLoading(true);
        try {
            // Gọi API register
            await authService.register(formData.email, formData.password);

            // Tự động login sau khi đăng ký
            await authService.login(
                formData.email,
                formData.password,
            );

            navigate("/company/register");
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            setMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 space-y-6 border border-gray-200">
                <h2 className="text-3xl font-extrabold text-gray-900 text-center">
                    Create Your Account
                </h2>

                {message && <p className="text-red-500 text-center font-medium">{message}</p>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Email"
                            className="flex-1 outline-none"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                        <LockClosedIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Password"
                            className="flex-1 outline-none"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                        <LockClosedIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirm Password"
                            className="flex-1 outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 disabled:opacity-50"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <span
                        className="text-blue-600 font-semibold cursor-pointer hover:underline"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
}