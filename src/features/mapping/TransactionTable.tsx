import React, {useState} from 'react';
import TransactionRow, { TransactionTableColumn } from '@/components/TransactionRow';
import {useTransactionsContext} from '@/context/TransactionsContext';
import {Transaction} from '@/model';
import ContextMenu from "@/components/ContextMenu";
import BackdropBlur from "@/components/BackdropBlur";

interface TransactionTableProps {
    transactions: Transaction[];
    pageSize?: number;
    visibleColumns?: TransactionTableColumn[];
}

const DEFAULT_COLUMNS: TransactionTableColumn[] = [
    'id', 'date', 'text', 'amount', 'from', 'to', 'type', 'category'
];

const COLUMN_HEADERS: Record<TransactionTableColumn, string> = {
    id: 'ID',
    date: 'Date',
    text: 'Text',
    amount: 'Amount',
    from: 'From',
    to: 'To',
    type: 'Map as',
    category: 'Categorize as',
};

const TransactionTable: React.FC<TransactionTableProps> = ({transactions, pageSize = 6, visibleColumns = DEFAULT_COLUMNS}) => {
    const {getTransactions} = useTransactionsContext();
    const [page, setPage] = useState(0);

    if (!transactions || transactions.length === 0) {
        return <div className="text-gray-400">No transactions to display</div>;
    }

    const paginatedTransactions = transactions.slice(page * pageSize, (page + 1) * pageSize);
    const totalPages = Math.ceil(transactions.length / pageSize);

    return (
        <>
            <TransactionContextMenu>
                {(handleContextMenu) => (
                    <table className="w-full text-sm border mb-2 table-fixed">
                        <thead>
                        <tr className="bg-gray-950">
                            {visibleColumns.map(col => (
                                <th key={col} className="p-2 border">
                                    {COLUMN_HEADERS[col]}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedTransactions.map(t => (
                            <TransactionRow
                                key={t.id}
                                transaction={t}
                                guessedLinkTransactions={getTransactions(t.guessedLinkedTransactions.map(e => e.linkedId))}
                                onContextMenu={handleContextMenu}
                                visibleColumns={visibleColumns}
                            />
                        ))}
                        </tbody>
                    </table>
                )}
            </TransactionContextMenu>
            <Pagination {...{page, totalPages, setPage}} />
        </>
    );
};

const Pagination: React.FC<{
    page: number;
    totalPages: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
}> = ({page, totalPages, setPage}) => (
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
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}>
            Next
        </button>
    </div>
);

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
