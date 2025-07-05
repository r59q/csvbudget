import React from 'react';
import { Transaction } from '@/model';
import {formatDayjsToDate} from "@/utility/datautils";

interface DateFieldProps {
    transaction: Transaction;
}

const DateField: React.FC<DateFieldProps> = ({ transaction }) => {
    return (
        <span className="font-mono text-xs text-blue-400" title={transaction.date.format('YYYY-MM-DD')}>
            {formatDayjsToDate(transaction.date)}
        </span>
    );
};

export default DateField;

