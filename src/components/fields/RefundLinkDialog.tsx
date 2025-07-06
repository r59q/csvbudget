import React from 'react';
import {TransactionID} from '@/model';
import BackdropBlur from '@/components/BackdropBlur';
import {useTransactionsContext} from '@/context/TransactionsContext';

interface RefundLinkDialogProps {
    open: boolean;
    onClose: () => void;
    search: string;
    setSearch: (s: string) => void;
    selectedId: TransactionID | null;
    setSelectedId: (id: TransactionID | null) => void;
    onConfirm: () => void;
}

const RefundLinkDialog: React.FC<RefundLinkDialogProps> = ({
                                                               open,
                                                               onClose,
                                                               search,
                                                               setSearch,
                                                               selectedId,
                                                               setSelectedId,
                                                               onConfirm,
                                                           }) => {
    const {transactions} = useTransactionsContext();
    const filtered = React.useMemo(() => {
        const s = search.trim().toLowerCase();
        // Only include transactions with amount <= 0 and not of type 'transfer'
        if (!s) return transactions.filter(t => t.amount <= 0 && t.type !== 'transfer');
        return transactions.filter(t =>
            (t.text.toLowerCase().includes(s) ||
                t.id.toString().includes(s) ||
                t.amount.toString().includes(s)) &&
            t.amount <= 0 &&
            t.type !== 'transfer'
        );
    }, [transactions, search]);

    if (!open) return null;

    return (
        <BackdropBlur>
            <div
                className="bg-gray-50 dark:bg-gray-900 p-6 rounded shadow-2xl flex flex-col items-center gap-4 max-w-2xl w-full border-2 border-gray-400">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Link Refund to Original
                    Transaction</h2>
                <input
                    className="w-full p-2 border rounded mb-2 text-gray-200"
                    placeholder="Search by text, ID, or amount..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoFocus
                />
                <div className="max-h-80 overflow-y-auto w-full">
                    <table className="w-full text-xs border border-gray-700 bg-gray-100 dark:bg-gray-800 rounded">
                        <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700">
                            <th className="p-1 border">Select</th>
                            <th className="p-1 border">ID</th>
                            <th className="p-1 border">Date</th>
                            <th className="p-1 border">Text</th>
                            <th className="p-1 border">Amount</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map(t => (
                            <tr
                                key={t.id}
                                className={
                                    (selectedId === t.id ? 'bg-gray-300 dark:bg-gray-600 ' : '') +
                                    'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700'
                                }
                                onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}>
                                <td className="p-1 border text-center" onClick={e => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={selectedId === t.id}
                                        onChange={() => setSelectedId(selectedId === t.id ? null : t.id)}
                                    />
                                </td>
                                <td className="p-1 border">{t.id}</td>
                                <td className="p-1 border">{t.date.format('YYYY-MM-DD')}</td>
                                <td className="p-1 border">{t.text}</td>
                                <td className="p-1 border">{t.amount}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex gap-2 mt-4 items-center">
                    <button
                        className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50"
                        onClick={onConfirm}
                        disabled={selectedId === null}
                    >
                        Confirm
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-400 text-black rounded"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="text-blue-600 cursor-pointer underline bg-transparent border-none p-0 ml-2"
                        onClick={() => {
                            setSelectedId(null);
                            onConfirm();
                        }}
                    >
                        Skip linking
                    </button>
                </div>
            </div>
        </BackdropBlur>
    );
};

export default RefundLinkDialog;
