import React from "react";
import {Envelope, Transaction} from "@/model";
import {useTransactionsContext} from "@/context/TransactionsContext";
import {formatEnvelope} from "@/utility/datautils";

interface EnvelopeFieldProps {
    transaction: Transaction;
}

const EnvelopeField: React.FC<EnvelopeFieldProps> = ({transaction}) => {
    const {getEnvelopeForTransaction, setEnvelopeForTransaction, envelopes} = useTransactionsContext();
    const envelope: Envelope = getEnvelopeForTransaction(transaction.id);
    const guessedEnvelope: Envelope = transaction.guessedEnvelope || "Unassigned";
    return <>
        <div className="flex items-center gap-2">
            <select
                className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1"
                value={envelope || "Unassigned"}
                onChange={e => setEnvelopeForTransaction(transaction, e.target.value)}>
                {["Unassigned", ...envelopes].map((env: Envelope) => (
                    <option key={env} value={env}>{formatEnvelope(env)}</option>
                ))}
            </select>
            <button
                type="button"
                className="ml-2 px-2 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 text-xs"
                title={`Set to guessed envelope: ${guessedEnvelope}`}
                onClick={() => setEnvelopeForTransaction(transaction, guessedEnvelope)}
                disabled={envelope === guessedEnvelope}>
                {formatEnvelope(guessedEnvelope)}
            </button>
        </div>
    </>;
};

export default EnvelopeField;
