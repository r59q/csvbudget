import React from "react";

interface ChipProps {
    label: string;
    selected?: boolean;
    onClick?: () => void;
    className?: string;
    icon?: React.ReactNode;
    ariaPressed?: boolean;
}

const Chip = ({
                  label,
                  selected = false,
                  onClick,
                  className = "",
                  icon,
                  ariaPressed
              }: ChipProps) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`transition-colors duration-150 flex items-center gap-2 px-4 py-1 rounded-full border text-xs font-semibold shadow-sm select-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
                selected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg scale-105'
                    : 'bg-gray-800 text-gray-200 border-gray-600 hover:bg-blue-900 hover:text-white'
            } ${className}`}
            aria-pressed={ariaPressed ?? selected}
        >
            {icon}
            {label}
        </button>
    );
};

export default Chip;

