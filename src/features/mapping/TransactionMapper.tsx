"use client";
import React, {useState} from 'react';
import {Transaction, TransactionType} from "@/model";
import {useGlobalContext} from "@/context/GlobalContext";
import TransactionRow from "@/components/TransactionRow";

interface Props {
    transactions: Transaction[];
}

const PAGE_SIZE = 10;

const TransactionMapper = ({transactions}: Props) => {
    const [page, setPage] = useState(0);
    const {isAccountOwned} = useGlobalContext();
    transactions.forEach(e => console.log(isAccountOwned(e.from), isAccountOwned(e.mappedFrom)))

    const unmappedTransactions = transactions.filter(t => !t.type || t.type === "unknown");
    const mappedTransactions = unmappedTransactions.filter(t => t.type !== "unknown");

    // Pagination
    const paginatedUnmapped = unmappedTransactions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    const totalPages = Math.ceil(unmappedTransactions.length / PAGE_SIZE);

    return (
        <div className="p-4 bg-gray-900 rounded-md flex flex-col gap-4 max-w-7xl w-full mx-auto">
            <div>
                <h2 className="text-lg font-semibold mb-2">
                    Unmapped Transactions
                </h2>
                {paginatedUnmapped.length === 0 ? (
                    <div className="text-gray-400">All transactions mapped!</div>
                ) : (
                    <table className="w-full text-sm border mb-2 table-fixed">
                        <thead>
                        <tr className="bg-gray-950">
                            <th className="p-2 border">ID</th>
                            <th className="p-2 border">Date</th>
                            <th className="p-2 border">Text</th>
                            <th className="p-2 border">Amount</th>
                            <th className="p-2 border">From</th>
                            <th className="p-2 border w-50">To</th>
                            <th className="p-2 border w-50">Map as</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedUnmapped.map(t => (
                            <TransactionRow
                                key={t.id}
                                transaction={t}
                            />
                        ))}
                        </tbody>
                    </table>
                )}
                <div className="flex justify-between items-center">
                    <button
                        className="px-2 py-1 rounded bg-gray-700 text-gray-200"
                        disabled={page === 0}
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                    >
                        Prev
                    </button>
                    <span>Page {page + 1} / {totalPages || 1}</span>
                    <button
                        className="px-2 py-1 rounded bg-gray-700 text-gray-200"
                        disabled={page + 1 >= totalPages}
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    >
                        Next
                    </button>
                </div>
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
                                    }}
                                >
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