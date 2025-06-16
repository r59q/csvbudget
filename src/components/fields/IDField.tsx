import React from 'react';
import { Transaction } from '@/model';

interface IDFieldProps {
    transaction: Transaction;
}

const IDField: React.FC<IDFieldProps> = ({ transaction }) => {
    return (
        <span className="font-mono text-xs text-gray-400" title={String(transaction.id)}>
            {transaction.id}
        </span>
    );
};

export default IDField;