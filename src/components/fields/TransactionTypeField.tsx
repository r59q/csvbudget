import React from 'react';
import {Transaction, TransactionID, TransactionType} from '@/model';
import {firstLetterUpper} from '@/utility/strutils';
import {useTransactionsContext} from "@/context/TransactionsContext";
import BackdropBlur from '@/components/BackdropBlur';
import {getTransactionTypeIcon} from './TransactionTypeIcons';
import RefundLinkDialog from './RefundLinkDialog';
import TransactionSelectTable from './TransactionSelectTable';

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
        setShowDialog(true);
    };

    const handleConfirmDialog = (selectedIds: TransactionID[]) => {
        if (pendingType) {
            setTransactionTypes(selectedIds, pendingType);
        }
        setShowDialog(false);
        setPendingType(null);
        setLikeTransactions([]);
    };

    const handleCancelDialog = () => {
        setShowDialog(false);
        setPendingType(null);
        setLikeTransactions([]);
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
                            className={`w-10 h-10 flex flex-col items-center justify-center rounded-md border transition-colors text-xl relative group ${transaction.type === opt ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-700 text-gray-100 border-gray-600 hover:bg-blue-800'}`}
                            onClick={() => handleTypeChange(opt)}
                            type="button"
                        >
                            <Icon/>
                            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity duration-200">
                                {firstLetterUpper(opt)}
                            </span>
                        </button>
                    );
                })}
            </div>
            {showDialog && (
                <BackdropBlur>
                    <div
                        className="bg-gray-900 p-6 rounded shadow-lg flex flex-col items-center gap-4 max-w-lg w-full">
                        <div>Are you sure you want to change the transaction type to <b>{pendingType}</b> for the
                            selected transactions?
                        </div>
                        <TransactionSelectTable
                            transactions={[transaction, ...likeTransactions]}
                            initialSelectedIds={[transaction.id, ...likeTransactions.map(t => t.id)]}
                            onConfirm={handleConfirmDialog}
                            onCancel={handleCancelDialog}
                        />
                    </div>
                </BackdropBlur>
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


export default TransactionTypeField;
