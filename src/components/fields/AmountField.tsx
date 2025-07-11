import React from 'react';
import { Transaction } from '@/model';
import useFormatCurrency from "@/hooks/FormatCurrency";

interface AmountFieldProps {
    transaction: Transaction;
}

const AmountField: React.FC<AmountFieldProps> = ({ transaction }) => {
    const isNegative = transaction.amount < 0;
    const formatCurrency = useFormatCurrency();
    return (
        <span className={isNegative ? "text-red-400 font-mono" : "text-green-400 font-mono"} title={String(transaction.amount)}>
            {formatCurrency(transaction.amount)}
        </span>
    );
};

export default AmountField;

