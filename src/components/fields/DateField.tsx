import React from 'react';
import { Transaction } from '@/model';

interface DateFieldProps {
    transaction: Transaction;
}

const DateField: React.FC<DateFieldProps> = ({ transaction }) => {
    return (
        <span className="font-mono text-xs text-blue-400" title={transaction.date.format('YYYY-MM-DD')}>
            {transaction.date.format('YYYY-MM-DD')}
        </span>
    );
};

export default DateField;

