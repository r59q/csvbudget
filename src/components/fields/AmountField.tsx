import React from 'react';
import { Transaction } from '@/model';
import {formatCurrency} from "@/utility/datautils";

interface AmountFieldProps {
    transaction: Transaction;
}

const AmountField: React.FC<AmountFieldProps> = ({ transaction }) => {
    const isNegative = transaction.amount < 0;
    return (
        <span className={isNegative ? "text-red-400 font-mono" : "text-green-400 font-mono"} title={String(transaction.amount)}>
            {formatCurrency(transaction.amount)}
        </span>
    );
};

export default AmountField;

