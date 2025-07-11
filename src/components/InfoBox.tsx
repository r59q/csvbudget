import React, {ReactNode} from "react";

interface InfoBoxProps {
    icon: ReactNode;
    title: string;
    description: ReactNode;
    secondary?: ReactNode;
    tip?: ReactNode;
    className?: string;
}

const InfoBox = ({icon, title, description, secondary, tip, className = ""}: InfoBoxProps) => {
    return (
        <div className={`p-4 rounded-lg bg-gradient-to-r from-blue-950/20 to-blue-900/40 border border-blue-900 text-blue-100 flex items-start gap-7 ${className}`}>
            <span className="self-center text-blue-300">{icon}</span>
            <div className="flex flex-col">
                <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">{title}</h2>
                <p className="mb-1">{description}</p>
                {secondary && <p className="mb-0 text-gray-400">{secondary}</p>}
                {tip && (
                    <div className="mt-2 bg-blue-950/30 border border-blue-900 rounded p-3 text-blue-200 text-sm">
                        {tip}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InfoBox;

