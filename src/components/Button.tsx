import React from "react";

interface Props extends React.ButtonHTMLAttributes<Omit<HTMLButtonElement, 'className'>> {
    children: React.ReactNode;
    className?: string;
}

export function Button({children, className, ...props}: Props) {
    return (
        <button
            className={`bg-blue-600 hover:bg-blue-700 select-none cursor-pointer text-white font-semibold px-6 py-2 rounded-full shadow-lg transition-colors ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
