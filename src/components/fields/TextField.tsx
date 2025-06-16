import React from 'react';
import { Transaction } from '@/model';

interface TextFieldProps {
    transaction: Transaction;
}

const TextField: React.FC<TextFieldProps> = ({ transaction }) => {
    return (
        <span className="text-sm text-gray-200" title={transaction.text}>
            {transaction.text}
        </span>
    );
};

export default TextField;

