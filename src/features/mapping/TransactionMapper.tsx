"use client";
import React from 'react';
import {Transaction} from "@/model";
import TransactionTable from './TransactionTable';

interface Props {
    transactions: Transaction[];
}

const PAGE_SIZE = 5;

const TransactionMapper = ({transactions}: Props) => {
    const unmappedTransactions = transactions.filter(t => !t.type || t.type === "unknown");
    const mappedTransactions = unmappedTransactions.filter(t => t.type !== "unknown");


    // Context menu state and handler are now managed in TransactionContextMenu
    return (
        <div className="p-4 bg-gray-900 rounded-md flex flex-col gap-4 max-w-7xl w-full mx-auto">
            <div>
                <h2 className="text-lg font-semibold mb-2">
                    Unmapped Transactions
                </h2>
                <TransactionTable transactions={unmappedTransactions} pageSize={PAGE_SIZE}/>
            </div>
            <div>
                <h2 className="text-lg font-semibold mb-2">
                    Mapped Transactions
                </h2>
                {mappedTransactions.length === 0 ? (
                    <div className="text-gray-400">No mapped transactions yet.</div>
                ) : (
                    <ul className="list-disc pl-5 text-gray-300">
                        {mappedTransactions.slice(-3).reverse().map(t => (
                            <li key={t.id} className="flex items-center justify-between gap-2">
                                <span>
                                    {t.date.format("YYYY-MM-DD")} - {t.text} - {t.amount} ({t.type})
                                </span>
                                <button
                                    className="ml-2 px-2 py-1 rounded bg-red-700 text-white text-xs hover:bg-red-800"
                                    onClick={() => {
                                        // TODO: Delete mapping implementation
                                    }}>
                                    Undo
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TransactionMapper;