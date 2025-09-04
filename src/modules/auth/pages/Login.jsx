import { useState } from "react";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function Login() {
    const [formData, setFormData] = useState({
        usernameOrEmail: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);
        try {
            await authService.login(formData.usernameOrEmail, formData.password);

            navigate("/show");
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
                    Login to Your Account
                </h2>

                {message && <p className="text-red-500 text-center font-medium">{message}</p>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Username or Email */}
                    <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <input
                            type="text"
                            name="usernameOrEmail"
                            value={formData.usernameOrEmail}
                            onChange={handleChange}
                            required
                            placeholder="Username or Email"
                            className="flex-1 outline-none"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                        <LockClosedIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Password"
                            className="flex-1 outline-none"
                        />
                        <button
                            type="button"
                            className="absolute right-3"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeSlashIcon className="w-5 h-5 text-gray-500" />
                            ) : (
                                <EyeIcon className="w-5 h-5 text-gray-500" />
                            )}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500">
                    Don't have an account?{" "}
                    <span
                        className="text-blue-600 font-semibold cursor-pointer hover:underline"
                        onClick={() => navigate("/register")}
                    >
                        Register
                    </span>
                </p>
            </div>
        </div>
    );
}
