import React from 'react';
import { useTransactionsContext } from '@/context/TransactionsContext';
import TransactionTable from '@/features/transaction/TransactionTable';

const TransactionsSection = () => {
    const { transactions } = useTransactionsContext();
    if (transactions.length === 0) return null;
    return (
        <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-10`}>
            <p className="font-semibold mb-2">All transactions</p>
            <TransactionTable compact transactions={transactions} />
        </div>
    );
};

export default TransactionsSection;

