import React from 'react';

interface BackdropBlurProps {
    children: React.ReactNode;
    className?: string;
}

const BackdropBlur: React.FC<BackdropBlurProps> = ({ children, className = '' }) => (
    <div className={`backdrop-blur-sm top-0 absolute w-screen h-screen ${className}`}>
        <div className="flex justify-center items-center h-full">
            {children}
        </div>
    </div>
);

export default BackdropBlur;

