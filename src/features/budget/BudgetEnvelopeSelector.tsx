import React from "react";
import {Envelope} from "@/model";

interface BudgetEnvelopeSelectorProps {
    envelopes: Envelope[];
    isEnvelopedBudgetSelected: (envelope: Envelope) => boolean;
    handleEnvelopeSelect: (envelope: Envelope) => void;
}

const BudgetEnvelopeSelector = ({ envelopes, isEnvelopedBudgetSelected, handleEnvelopeSelect }: BudgetEnvelopeSelectorProps) => {
    // Find the selected range for better visual feedback
    const selectedIndices = envelopes
        .map((envelope, index) => ({ envelope, index }))
        .filter(({ envelope }) => isEnvelopedBudgetSelected(envelope))
        .map(({ index }) => index);

    const hasSelection = selectedIndices.length > 0;
    const isRangeSelection = selectedIndices.length > 1;
    const rangeStart = hasSelection ? Math.min(...selectedIndices) : -1;
    const rangeEnd = hasSelection ? Math.max(...selectedIndices) : -1;

    const getEnvelopeStyle = (envelope: Envelope, index: number) => {
        const isSelected = isEnvelopedBudgetSelected(envelope);
        const isRangeStart = isRangeSelection && index === rangeStart;
        const isRangeEnd = isRangeSelection && index === rangeEnd;
        const isInMiddle = isSelected && !isRangeStart && !isRangeEnd && isRangeSelection;

        const baseClasses = "px-2 py-1 border-2 cursor-pointer select-none rounded transition-colors duration-150 text-center";

        if (isSelected) {
            if (isRangeStart && isRangeEnd) {
                // Single selection
                return `${baseClasses} bg-blue-900 border-blue-400 font-medium`;
            } else if (isRangeStart) {
                return `${baseClasses} bg-green-900 border-green-400 font-medium`;
            } else if (isRangeEnd) {
                return `${baseClasses} bg-red-900 border-red-400 font-medium`;
            } else if (isInMiddle) {
                return `${baseClasses} bg-yellow-900 border-yellow-400`;
            }
        }

        return `${baseClasses} hover:bg-gray-700 border-gray-600`;
    };

    const getEnvelopeTitle = (envelope: Envelope, index: number) => {
        const isSelected = isEnvelopedBudgetSelected(envelope);
        const isRangeStart = isRangeSelection && index === rangeStart;
        const isRangeEnd = isRangeSelection && index === rangeEnd;

        if (isSelected) {
            if (isRangeStart && isRangeEnd) {
                return "Selected envelope (click to deselect)";
            } else if (isRangeStart) {
                return "Range start (click inside range to reset to single selection)";
            } else if (isRangeEnd) {
                return "Range end (click inside range to reset to single selection)";
            } else {
                return "In selected range (click to reset to single selection)";
            }
        }

        return hasSelection
            ? "Click to extend range to this envelope"
            : "Click to start selecting range";
    };

    return (
        <div className={"flex flex-col flex-1/4 bg-gray-800 p-4 rounded-xl"}>
            <h2 className="text-lg font-semibold mb-2">Select Envelope Range</h2>
            <div className={"grid grid-cols-4 text-sm gap-2"}>
                {envelopes.map((envelope, index) => (
                    <span
                        className={getEnvelopeStyle(envelope, index)}
                        onClick={() => handleEnvelopeSelect(envelope)}
                        key={envelope}
                        title={getEnvelopeTitle(envelope, index)}
                    >
                        {envelope}
                    </span>
                ))}
            </div>
            <div className="text-xs text-gray-400 mt-2 space-y-1">
                <p>
                    {hasSelection ? (
                        isRangeSelection ? (
                            <>Selected range: <span className="text-green-400">{envelopes[rangeStart]}</span> to <span className="text-red-400">{envelopes[rangeEnd]}</span> ({selectedIndices.length} envelopes)</>
                        ) : (
                            <>Selected: <span className="text-blue-400">{envelopes[rangeStart]}</span></>
                        )
                    ) : (
                        "No envelopes selected"
                    )}
                </p>
                <p>Click an envelope to start/extend selection. Click within range to reset to single selection.</p>
            </div>
        </div>
    );
};

export default BudgetEnvelopeSelector;
