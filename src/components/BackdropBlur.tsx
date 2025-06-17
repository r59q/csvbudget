import React from 'react';

interface BackdropBlurProps {
    children: React.ReactNode;
    className?: string;
}

const BackdropBlur: React.FC<BackdropBlurProps> = ({ children, className = '' }) => (
    <div className={`backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center ${className}`}>
        <div className="flex justify-center items-center w-full h-full">
            {children}
        </div>
    </div>
);

export default BackdropBlur;
