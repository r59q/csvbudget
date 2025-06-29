import React from 'react';
import { Transaction } from '@/model';

interface TextFieldProps {
    transaction: Transaction;
}

const TextField: React.FC<TextFieldProps> = ({ transaction }) => {
    return (
        <span
            className="text-sm text-gray-200 truncate block max-w-full cursor-pointer"
            title={transaction.text}
            style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}
        >
            {transaction.text}
        </span>
    );
};

export default TextField;
