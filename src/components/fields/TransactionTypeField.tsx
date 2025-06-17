import React from 'react';
import { Transaction, TransactionType } from '@/model';
import { firstLetterUpper } from '@/utility/strutils';
import {useTransactionsContext} from "@/context/TransactionsContext";
import BackdropBlur from '@/components/BackdropBlur';

interface MappingFieldProps {
    transaction: Transaction;
}

const TRANSACTION_TYPES: TransactionType[] = ["income", "expense", "transfer", "unknown"];

const TransactionTypeField: React.FC<MappingFieldProps> = ({ transaction }) => {
    const {setTransactionType, setTransactionTypes, getUnmappedTransactionsLike} = useTransactionsContext();
    const [showDialog, setShowDialog] = React.useState(false);
    const [pendingType, setPendingType] = React.useState<TransactionType | null>(null);
    const [likeTransactions, setLikeTransactions] = React.useState<Transaction[]>([]);

    const handleTypeChange = (type: TransactionType) => {
        setPendingType(type);
        setLikeTransactions(getUnmappedTransactionsLike(transaction));
        setShowDialog(true);
    };

    const confirmChange = () => {
        if (pendingType) {
            const ids = [transaction, ...likeTransactions].map(t => t.id);
            setTransactionTypes(ids, pendingType);
        }
        setShowDialog(false);
        setPendingType(null);
        setLikeTransactions([]);
    };

    const cancelChange = () => {
        setShowDialog(false);
        setPendingType(null);
        setLikeTransactions([]);
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
                <BackdropBlur>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg flex flex-col items-center gap-4 max-w-lg w-full">
                        <div>Are you sure you want to change the transaction type to <b>{pendingType}</b> for the following transactions?</div>
                        <div className="max-h-48 overflow-y-auto w-full">
                            <table className="w-full text-xs border border-gray-800 bg-gray-900 rounded">
                                <thead>
                                    <tr className="bg-gray-800">
                                        <th className="p-1 border">ID</th>
                                        <th className="p-1 border">Date</th>
                                        <th className="p-1 border">Text</th>
                                        <th className="p-1 border">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[transaction, ...likeTransactions].map(t => (
                                        <tr key={t.id} className="even:bg-gray-800">
                                            <td className="p-1 border">{t.id}</td>
                                            <td className="p-1 border">{t.date.format("YYYY-MM-DD")}</td>
                                            <td className="p-1 border">{t.text}</td>
                                            <td className="p-1 border">{t.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={confirmChange}>Confirm</button>
                            <button className="px-4 py-2 bg-gray-400 text-black rounded" onClick={cancelChange}>Cancel</button>
                        </div>
                    </div>
                </BackdropBlur>
            )}
        </>
    );
};

export default TransactionTypeField;
