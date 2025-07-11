import React from "react";
import Chip from "@/components/Chip";
import { formatEnvelope } from "@/utility/datautils";

interface EnvelopeChipSelectorProps {
    envelopes: string[];
    isEnvelopeSelected: (envelope: string) => boolean;
    toggleSelectedEnvelope: (envelope: string) => void;
}

const EnvelopeChipSelector = ({ envelopes, isEnvelopeSelected, toggleSelectedEnvelope }: EnvelopeChipSelectorProps) => {
    return (
        <div className="flex flex-wrap gap-2 mb-4">
            {envelopes && envelopes.length > 0 ? (
                envelopes.map((env) => (
                    <Chip
                        key={env}
                        label={formatEnvelope(env)}
                        selected={isEnvelopeSelected(env)}
                        onClick={() => toggleSelectedEnvelope(env)}
                        icon={isEnvelopeSelected(env) ? (
                            <span className="inline-block w-2.5 h-2.5 bg-blue-300 rounded-full mr-1" />
                        ) : (
                            <span className="inline-block w-2.5 h-2.5 bg-gray-400 rounded-full mr-1" />
                        )}
                    />
                ))
            ) : (
                <span className="text-gray-400 text-xs">No envelopes found</span>
            )}
        </div>
    );
};

export default EnvelopeChipSelector;

