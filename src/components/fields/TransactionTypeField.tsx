import React from 'react';
import {Transaction, TransactionID, TransactionType} from '@/model';
import {firstLetterUpper} from '@/utility/strutils';
import {useTransactionsContext} from "@/context/TransactionsContext";
import BackdropBlur from '@/components/BackdropBlur';
import {getTransactionTypeIcon} from './TransactionTypeIcons';
import RefundLinkDialog from './RefundLinkDialog';

interface MappingFieldProps {
    transaction: Transaction;
}

const TRANSACTION_TYPES: TransactionType[] = ["income", "expense", "transfer", "refund", "unknown"];

const TransactionTypeField: React.FC<MappingFieldProps> = ({transaction}) => {
    const {
        setTransactionTypes,
        getUnmappedTransactionsLike,
        setTransactionLinkAndType,
        getTransaction
    } = useTransactionsContext();
    const [showDialog, setShowDialog] = React.useState(false);
    const [pendingType, setPendingType] = React.useState<TransactionType | null>(null);
    const [likeTransactions, setLikeTransactions] = React.useState<Transaction[]>([]);
    const [selectedIds, setSelectedIds] = React.useState<TransactionID[]>([]);
    const [showRefundDialog, setShowRefundDialog] = React.useState(false);
    const [refundSearch, setRefundSearch] = React.useState('');
    const [refundSelectedId, setRefundSelectedId] = React.useState<TransactionID | null>(null);

    const handleTypeChange = (type: TransactionType) => {
        if (type === 'refund') {
            setRefundSelectedId(null);
            setShowRefundDialog(true);
            return;
        }
        const likeTxs = getUnmappedTransactionsLike(transaction);
        const allIds = [transaction.id, ...likeTxs.map(t => t.id)];
        if (allIds.length === 1) {
            setTransactionTypes(allIds, type);
            return;
        }
        setPendingType(type);
        setLikeTransactions(likeTxs);
        setSelectedIds(allIds); // default: all selected
        setShowDialog(true);
    };

    const toggleSelect = (id: TransactionID) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const confirmChange = () => {
        if (pendingType) {
            setTransactionTypes(selectedIds, pendingType);
        }
        setShowDialog(false);
        setPendingType(null);
        setLikeTransactions([]);
        setSelectedIds([]);
    };

    const cancelChange = () => {
        setShowDialog(false);
        setPendingType(null);
        setLikeTransactions([]);
        setSelectedIds([]);
    };

    const handleConfirmRefundLink = () => {
        if (!refundSelectedId) return;

        const refundSelectedTransaction = getTransaction(refundSelectedId);
        if (!refundSelectedTransaction) return;

        setTransactionLinkAndType(transaction, refundSelectedTransaction, 'refund');
        setTransactionTypes([transaction.id], 'refund');
        setShowRefundDialog(false);
        setRefundSearch('');
        setRefundSelectedId(null);
    };
    return (
        <>
            <div className="flex gap-2 my-1">
                {TRANSACTION_TYPES.map(opt => {
                    const Icon = getTransactionTypeIcon(opt);
                    return (
                        <button
                            key={opt}
                            className={`w-10 h-10 flex items-center justify-center rounded-md border transition-colors text-xl ${transaction.type === opt ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-400 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800'}`}
                            onClick={() => handleTypeChange(opt)}
                            type="button"
                            title={firstLetterUpper(opt)}
                        >
                            <Icon/>
                        </button>
                    );
                })}
            </div>
            {showDialog && (
                <TransactionTypeConfirmDialog
                    pendingType={pendingType}
                    transaction={transaction}
                    likeTransactions={likeTransactions}
                    selectedIds={selectedIds}
                    toggleSelect={toggleSelect}
                    confirmChange={confirmChange}
                    cancelChange={cancelChange}
                />
            )}
            {showRefundDialog && (
                <RefundLinkDialog
                    open={showRefundDialog}
                    onClose={() => setShowRefundDialog(false)}
                    search={refundSearch}
                    setSearch={setRefundSearch}
                    selectedId={refundSelectedId}
                    setSelectedId={setRefundSelectedId}
                    onConfirm={handleConfirmRefundLink}
                />
            )}
        </>
    );
};

interface TransactionTypeConfirmDialogProps {
    pendingType: TransactionType | null;
    transaction: Transaction;
    likeTransactions: Transaction[];
    selectedIds: TransactionID[];
    toggleSelect: (id: TransactionID) => void;
    confirmChange: () => void;
    cancelChange: () => void;
}

const TransactionTypeConfirmDialog: React.FC<TransactionTypeConfirmDialogProps> = ({
                                                                                       pendingType,
                                                                                       transaction,
                                                                                       likeTransactions,
                                                                                       selectedIds,
                                                                                       toggleSelect,
                                                                                       confirmChange,
                                                                                       cancelChange
                                                                                   }) => (
    <BackdropBlur>
        <div
            className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg flex flex-col items-center gap-4 max-w-lg w-full">
            <div>Are you sure you want to change the transaction type to <b>{pendingType}</b> for the selected
                transactions?
            </div>
            <div className="max-h-90 overflow-y-auto w-full">
                <table className="w-full text-xs border border-gray-800 bg-gray-900 rounded">
                    <thead>
                    <tr className="bg-gray-800">
                        <th className="p-1 border">Select</th>
                        <th className="p-1 border">ID</th>
                        <th className="p-1 border">Date</th>
                        <th className="p-1 border">Text</th>
                        <th className="p-1 border">Amount</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td className="p-1 border text-center">
                            <input type="checkbox" checked={selectedIds.includes(transaction.id)}
                                   onChange={() => toggleSelect(transaction.id)}/>
                        </td>
                        <td className="p-1 border">{transaction.id}</td>
                        <td className="p-1 border">{transaction.date.format("YYYY-MM-DD")}</td>
                        <td className="p-1 border">{transaction.text}</td>
                        <td className="p-1 border">{transaction.amount}</td>
                    </tr>
                    {likeTransactions.map(t => (
                        <tr key={t.id} className="even:bg-gray-800">
                            <td className="p-1 border text-center">
                                <input type="checkbox" checked={selectedIds.includes(t.id)}
                                       onChange={() => toggleSelect(t.id)}/>
                            </td>
                            <td className="p-1 border">{t.id}</td>
                            <td className="p-1 border">{t.date.format("YYYY-MM-DD")}</td>
                            <td className="p-1 border">{t.text}</td>
                            <td className="p-1 border">{t.amount}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="flex gap-2 mt-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={confirmChange}
                        disabled={selectedIds.length === 0}>Confirm
                </button>
                <button className="px-4 py-2 bg-gray-400 text-black rounded" onClick={cancelChange}>Cancel</button>
            </div>
        </div>
    </BackdropBlur>
);

export default TransactionTypeField;
