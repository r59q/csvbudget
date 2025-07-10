import React, { PropsWithChildren } from 'react';
import { IoClose } from 'react-icons/io5';

interface BackdropBlurProps {
    children: React.ReactNode;
    className?: string;
    onClose?: () => void;
}

const BackdropBlur: React.FC<BackdropBlurProps> = ({ children, className = '', onClose }: PropsWithChildren<BackdropBlurProps>) => (
    <div className={`backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center ${className}`}>
        <div className="flex justify-center items-center w-full h-full">
            <div className="relative">
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute -top-4 -right-4 text-gray-500 hover:text-gray-800 bg-white/70 rounded-full p-2 shadow focus:outline-none"
                        aria-label="Close"
                    >
                        <IoClose size={24} />
                    </button>
                )}
                {children}
            </div>
        </div>
    </div>
);

export default BackdropBlur;
