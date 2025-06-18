import React from 'react';
import {Transaction, TransactionID, TransactionType} from '@/model';
import { firstLetterUpper } from '@/utility/strutils';
import {useTransactionsContext} from "@/context/TransactionsContext";
import BackdropBlur from '@/components/BackdropBlur';

interface MappingFieldProps {
    transaction: Transaction;
}

const TRANSACTION_TYPES: TransactionType[] = ["income", "expense", "transfer", "unknown"];

const TransactionTypeField: React.FC<MappingFieldProps> = ({ transaction }) => {
    const {setTransactionTypes, getUnmappedTransactionsLike} = useTransactionsContext();
    const [showDialog, setShowDialog] = React.useState(false);
    const [pendingType, setPendingType] = React.useState<TransactionType | null>(null);
    const [likeTransactions, setLikeTransactions] = React.useState<Transaction[]>([]);
    const [selectedIds, setSelectedIds] = React.useState<TransactionID[]>([]);

    const handleTypeChange = (type: TransactionType) => {
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

    return (
        <>
            <select
                className="p-1 border w-full"
                value={transaction.type || "unknown"}
                onChange={e => handleTypeChange(e.target.value as TransactionType)}>
                <option value="" className={"bg-gray-800"}>Select type</option>
                {TRANSACTION_TYPES.map(opt => (
                    <option className={"bg-gray-800"} key={opt} value={opt}>{firstLetterUpper(opt)}</option>
                ))}
            </select>
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
        <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg flex flex-col items-center gap-4 max-w-lg w-full">
            <div>Are you sure you want to change the transaction type to <b>{pendingType}</b> for the selected transactions?</div>
            <div className="max-h-48 overflow-y-auto w-full">
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
                                <input type="checkbox" checked={selectedIds.includes(transaction.id)} onChange={() => toggleSelect(transaction.id)} />
                            </td>
                            <td className="p-1 border">{transaction.id}</td>
                            <td className="p-1 border">{transaction.date.format("YYYY-MM-DD")}</td>
                            <td className="p-1 border">{transaction.text}</td>
                            <td className="p-1 border">{transaction.amount}</td>
                        </tr>
                        {likeTransactions.map(t => (
                            <tr key={t.id} className="even:bg-gray-800">
                                <td className="p-1 border text-center">
                                    <input type="checkbox" checked={selectedIds.includes(t.id)} onChange={() => toggleSelect(t.id)} />
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
                <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={confirmChange} disabled={selectedIds.length === 0}>Confirm</button>
                <button className="px-4 py-2 bg-gray-400 text-black rounded" onClick={cancelChange}>Cancel</button>
            </div>
        </div>
    </BackdropBlur>
);

export default TransactionTypeField;
