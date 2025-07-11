"use client";
import React from 'react';
import {Transaction} from "@/model";
import TransactionTable from "@/features/transaction/TransactionTable";

interface Props {
    transactions: Transaction[];
}

const PAGE_SIZE = 5;

const TransactionMapper = ({transactions}: Props) => {
    const unmappedTransactions = transactions.filter(t => !t.type || t.type === "unknown");
    // Context menu state and handler are now managed in TransactionContextMenu
    return (
        <div className="p-4 bg-gray-900 rounded-md flex flex-col gap-4 max-w-7xl w-full mx-auto">
            <div className="mb-4 p-4 bg-gray-800 rounded flex items-center gap-3 text-gray-200">
                <span className="text-2xl text-blue-400">
                    <i className="inline-block align-middle">
                        <svg className="inline-block align-middle" width="1em" height="1em" viewBox="0 0 24 24"
                             fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
                                fill="currentColor"/>
                        </svg>
                    </i>
                </span>
                <div>
                    <div className="font-semibold">How to map transactions</div>
                    <div className="text-sm text-gray-400">
                        Assign categories, envelopes, and types to your transactions. Unmapped transactions are shown
                        below. Use the table to map each transaction to the correct type, category, and envelope.
                    </div>
                </div>
            </div>
            <div>
                <div className={"flex flex-row justify-between"}>
                    <h2 className="text-lg font-semibold mb-2">
                        Unmapped Transactions
                    </h2>
                    <h4 className="text-lg mb-2">
                        Use the &apos;Map as&apos; column to map transactions
                    </h4>
                </div>
                <TransactionTable transactions={unmappedTransactions}
                                  visibleColumns={["date", "text", "amount", "from", "to", "type"]}
                                  pageSize={PAGE_SIZE}/>
            </div>
        </div>
    );
};

export default TransactionMapper;