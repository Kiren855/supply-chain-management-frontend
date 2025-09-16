import React from 'react';

const Button = ({
    children,
    onClick,
    variant = 'primary',
    className = '',
    ...props
}) => {
    const baseStyles = `
        flex items-center justify-center gap-2 
        font-semibold rounded-lg shadow-lg 
        transform transition-all duration-300
        hover:shadow-xl hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-lg
        px-4 py-2 text-sm 
        md:px-5 md:py-2.5 md:text-base
    `;

    const variantStyles = {
        primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white focus:ring-blue-500',
        secondary: 'bg-gray-200 text-gray-800 focus:ring-gray-400',
        danger: 'bg-red-600 text-white focus:ring-red-500',
        success: 'bg-green-600 text-white focus:ring-green-500',
        // --- Thêm biến thể màu vàng ---
        warning: 'bg-yellow-500 text-white focus:ring-yellow-400',
        // --- Thêm biến thể màu cyan/sky ---
        info: 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white focus:ring-cyan-400',
    };

    return (
        <button
            onClick={onClick}
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;