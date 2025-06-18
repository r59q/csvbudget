import React, {useState} from 'react';
import TransactionRow from '@/components/TransactionRow';
import {useTransactionsContext} from '@/context/TransactionsContext';
import {Transaction} from '@/model';
import ContextMenu from "@/components/ContextMenu";
import BackdropBlur from "@/components/BackdropBlur";

interface TransactionTableProps {
    transactions: Transaction[];
    pageSize?: number;
}

const TransactionTable: React.FC<TransactionTableProps> = ({transactions, pageSize = 5}) => {
    const {getTransactions} = useTransactionsContext();
    const [page, setPage] = useState(0);

    const paginatedUnmapped = transactions.slice(page * pageSize, (page + 1) * pageSize);
    const totalPages = Math.ceil(transactions.length / pageSize);

    return (

        <div className="p-4 bg-gray-900 rounded-md flex flex-col gap-4 max-w-7xl w-full mx-auto">
            <h1 className={"text-lg"}>Categorize transactions</h1>

            {paginatedUnmapped.length === 0 ? (
                <div className="text-gray-400">No transactions to display</div>
            ) : (
                <TransactionContextMenu>
                    {(handleContextMenu) => (
                        <table className="w-full text-sm border mb-2 table-fixed">
                            <thead>
                            <tr className="bg-gray-950">
                                <th className="p-2 border">ID</th>
                                <th className="p-2 border">Date</th>
                                <th className="p-2 border">Text</th>
                                <th className="p-2 border">Amount</th>
                                <th className="p-2 border">From</th>
                                <th className="p-2 border w-40">To</th>
                                <th className="p-2 border w-40">Map as</th>
                                <th className="p-2 border w-40">Categorize as</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedUnmapped.map(t => (
                                <TransactionRow
                                    key={t.id}
                                    transaction={t}
                                    guessedLinkTransactions={getTransactions(t.guessedLinkedTransactions.map(e => e.linkedId))}
                                    onContextMenu={handleContextMenu}
                                />
                            ))}
                            </tbody>
                        </table>
                    )}
                </TransactionContextMenu>
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
    );
};


const TransactionContextMenu: React.FC<{
    children: (onContextMenu: (e: React.MouseEvent, transaction: Transaction) => void) => React.ReactNode
}> = ({children}) => {
    const [menuVisible, setMenuVisible] = React.useState(false);
    const [menuPosition, setMenuPosition] = React.useState<{ x: number; y: number }>({x: 0, y: 0});
    const [showDialog, setShowDialog] = React.useState(false);
    const [menuTransaction, setMenuTransaction] = React.useState<Transaction | null>(null);

    const handleContextMenu = (e: React.MouseEvent, transaction: Transaction) => {
        e.preventDefault();
        setMenuPosition({x: e.clientX, y: e.clientY});
        setMenuTransaction(transaction);
        setShowDialog(false);
        setMenuVisible(true);
    };

    return (
        <>
            {children(handleContextMenu)}
            <ContextMenu
                visible={menuVisible}
                position={menuPosition}
                onClose={() => setMenuVisible(false)}
            >
                <li className="px-4 py-2 cursor-pointer hover:bg-gray-800" onClick={() => {
                    setMenuVisible(false);
                    setShowDialog(true);
                }}>
                    View JSON
                </li>
            </ContextMenu>
            {showDialog && menuTransaction && (
                <BackdropBlur className="fixed inset-0 z-[10] flex items-center justify-center">
                    <div
                        className="bg-gray-800 text-white p-6 rounded shadow-lg max-w-2xl w-full relative flex flex-col items-center">
                        <button
                            className="absolute top-2 right-2 text-gray-400 hover:text-white text-3xl leading-none w-10 h-10 flex items-center justify-center cursor-pointer"
                            onClick={() => setShowDialog(false)}>
                            &times;
                        </button>
                        <h2 className="text-lg font-semibold mb-4">Transaction JSON</h2>
                        <pre className="bg-gray-900 p-4 rounded overflow-x-auto text-xs max-h-[60vh] w-full">
                            {JSON.stringify(menuTransaction, null, 2)}
                        </pre>
                    </div>
                </BackdropBlur>
            )}
        </>
    );
};


export default TransactionTable;

