import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import companyService from "../services/companyService";

export default function CompanyRegister() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        companyName: "",
        legalName: "",
        taxId: "",
        address: "",
        companyPhone: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await companyService.createCompany(formData);
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            alert("Lỗi khi lưu thông tin công ty!");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg"
            >
                <h2 className="text-2xl font-bold mb-6">Thông tin công ty</h2>

                {["companyName", "legalName", "taxId", "address", "companyPhone"].map((field) => (
                    <div className="mb-4" key={field}>
                        <label className="block text-sm font-medium">{field}</label>
                        <input
                            type="text"
                            name={field}
                            value={formData[field]}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2"
                            required={field === "companyName"}
                        />
                    </div>
                ))}

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                    Lưu và tiếp tục
                </button>
            </form>
        </div>
    );
}
