import React from "react";
import {Envelope} from "@/model";

interface BudgetEnvelopeSelectorProps {
    envelopes: Envelope[];
    isEnvelopedBudgetSelected: (envelope: Envelope) => boolean;
    handleEnvelopeSelect: (envelope: Envelope) => void;
}

const BudgetEnvelopeSelector = ({ envelopes, isEnvelopedBudgetSelected, handleEnvelopeSelect }: BudgetEnvelopeSelectorProps) => {
    return (
        <div className={"flex flex-col flex-1/4 bg-gray-800 p-4 rounded-xl"}>
            <h2 className="text-lg font-semibold mb-2">Select Envelope Range</h2>
            <div className={"grid grid-cols-4 text-sm gap-2"}>
                {envelopes.map(envelope => {
                    const isSelected = isEnvelopedBudgetSelected(envelope);
                    return (
                        <span
                            className={`px-1 border-2 cursor-pointer select-none rounded transition-colors duration-100 ${isSelected ? "bg-green-900 border-green-400" : "hover:bg-gray-700 border-gray-600"}`}
                            onClick={() => handleEnvelopeSelect(envelope)}
                            key={envelope}
                            title={isSelected ? "Selected in range" : "Click to select range"}
                        >
                            {envelope}
                        </span>
                    );
                })}
            </div>
            <p className="text-xs text-gray-400 mt-2">Click to select the start and end of the envelope range.</p>
        </div>
    );
};

export default BudgetEnvelopeSelector;
