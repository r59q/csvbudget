import React from 'react';
import { Transaction, TransactionType } from '@/model';
import { firstLetterUpper } from '@/utility/strutils';

interface MappingFieldProps {
    transaction: Transaction;
}

const TRANSACTION_TYPES: TransactionType[] = ["income", "expense", "refund", "unknown"];

const MappingField: React.FC<MappingFieldProps> = ({ transaction }) => {
    const handleMap = (type: TransactionType) => {
        // TODO: Do stuff
    }
    return (
        <select
            className="p-1 border w-full"
            value={transaction.type || "unknown"}
            onChange={e => handleMap(e.target.value as TransactionType)}>
            <option value="" className={"bg-gray-800"}>Select type</option>
            {TRANSACTION_TYPES.map(opt => (
                <option className={"bg-gray-800"} key={opt} value={opt}>{firstLetterUpper(opt)}</option>
            ))}
        </select>
    );
};

export default MappingField;

