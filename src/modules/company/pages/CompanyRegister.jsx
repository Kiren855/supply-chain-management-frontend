import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import companyService from "../services/companyService";


export default function CompanyRegister() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        company_name: "",
        company_legal_name: "",
        company_tax_id: "",
        company_address: "",
        company_phone: "",
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.company_name.trim()) newErrors.company_name = "Company Name is required";
        if (!formData.company_legal_name.trim()) newErrors.company_legal_name = "Legal Name is required";
        if (!formData.company_tax_id.trim()) newErrors.company_tax_id = "Tax ID is required";
        else if (!/^\d+$/.test(formData.company_tax_id)) newErrors.company_tax_id = "Tax ID must be numeric";
        if (!formData.company_address.trim()) newErrors.company_address = "Address is required";
        if (!formData.company_phone.trim()) newErrors.company_phone = "Phone is required";
        else if (!/^\+?[0-9\s]{7,20}$/.test(formData.company_phone)) newErrors.company_phone = "Invalid phone number";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await companyService.update(formData);
            navigate("/show");
        } catch (err) {
            console.error(err);
            alert("Error saving company information!");
        }
    };

    const fields = [
        { name: "company_name", label: "Company Name", required: true },
        { name: "company_legal_name", label: "Legal Name", required: true },
        { name: "company_tax_id", label: "Tax ID", required: true },
        { name: "company_address", label: "Address", required: true },
        { name: "company_phone", label: "Phone", required: true },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg space-y-5"
            >
                <h2 className="text-2xl font-bold text-center">Company Information</h2>

                {fields.map((field) => (
                    <div key={field.name} className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">{field.label}</label>
                        <input
                            type="text"
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            placeholder={field.label}
                            className={`mt-1 block w-full rounded-lg border p-2 outline-none focus:ring-2 focus:ring-blue-500 ${errors[field.name] ? "border-red-500" : "border-gray-300"
                                }`}
                            required={field.required}
                        />
                        {errors[field.name] && (
                            <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                        )}
                    </div>
                ))}

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition duration-300"
                >
                    Save and Continue
                </button>
            </form>
        </div>
    );
}
