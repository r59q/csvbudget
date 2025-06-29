import React, {useRef} from "react";
import {LinkType, Transaction} from "@/model";
import IDField from "@/components/fields/IDField";
import AccountField from "@/components/fields/AccountField";
import DateField from "@/components/fields/DateField";
import TextField from "@/components/fields/TextField";
import AmountField from "@/components/fields/AmountField";
import TransactionTypeField from "@/components/fields/TransactionTypeField";
import CategoryField from "@/components/fields/CategoryField";
import {useTransactionsContext} from "@/context/TransactionsContext";
import {TransactionTableColumn} from "@/features/mapping/TransactionTable";


interface TransactionRowProps {
    transaction: Transaction;
    onContextMenu?: (e: React.MouseEvent, transaction: Transaction) => void;
    guessedLinkTransactions: Transaction[];
    visibleColumns?: TransactionTableColumn[];
}

const TransactionRow: React.FC<TransactionRowProps> = ({transaction, onContextMenu, guessedLinkTransactions, visibleColumns}) => {
    const rowRef = useRef<HTMLTableRowElement>(null);
    const [expanded, setExpanded] = React.useState(false);

    return (
        <>
            <tr
                ref={rowRef}
                onContextMenu={onContextMenu ? (e) => onContextMenu(e, transaction) : undefined}
                key={transaction.id}
                className={"even:bg-gray-800 hover:bg-blue-950"}
            >
                {(!visibleColumns || visibleColumns.includes('id')) && (
                    <td className="p-2 border cursor-pointer hover:underline" onClick={() => setExpanded(e => !e)}>
                        <IDField transaction={transaction}/>
                    </td>
                )}
                {(!visibleColumns || visibleColumns.includes('date')) && (
                    <td className="p-2 border"><DateField transaction={transaction}/></td>
                )}
                {(!visibleColumns || visibleColumns.includes('text')) && (
                    <td className="p-2 border"><TextField transaction={transaction}/></td>
                )}
                {(!visibleColumns || visibleColumns.includes('amount')) && (
                    <td className="p-2 border"><AmountField transaction={transaction}/></td>
                )}
                {(!visibleColumns || visibleColumns.includes('from')) && (
                    <td className="p-2 border w-50"><AccountField account={transaction.from}/></td>
                )}
                {(!visibleColumns || visibleColumns.includes('to')) && (
                    <td className="p-2 border w-50"><AccountField account={transaction.to}/></td>
                )}
                {(!visibleColumns || visibleColumns.includes('type')) && (
                    <td className="p-2 border"><TransactionTypeField transaction={transaction}/></td>
                )}
                {(!visibleColumns || visibleColumns.includes('category')) && (
                    <td className="p-2 border"><CategoryField transaction={transaction}/></td>
                )}
            </tr>
            {expanded && <ExpandedTransactionRow {...{transaction, guessedLinkTransactions}} />}
        </>
    );
};

interface ExpandedTransactionRowProps {
    transaction: Transaction;
    guessedLinkTransactions: Transaction[];
}

const ExpandedTransactionRow = ({ transaction, guessedLinkTransactions }: ExpandedTransactionRowProps) => {
    const {unsetTransactionLink, setTransactionLink, setTransactionLinkType} = useTransactionsContext()
    return (
        <tr className="even:bg-gray-800">
            <td colSpan={7} className="py-2 border-t-0 border-b border-l border-r border-gray-700 bg-gray-950">
                {guessedLinkTransactions.length > 0 ? (
                    <div className={"max-h-50 overflow-y-auto"}>
                        <div className="text-xs text-gray-400 mb-2 pl-2 sticky top-0 bg-gray-950 pb-1">Linked transactions:</div>
                        <table className="w-full text-xs border border-gray-800 bg-gray-900 rounded">
                            <thead>
                                <tr className="bg-gray-800">
                                    <th className="p-1 border">Link</th>
                                    <th className="p-1 border">Date</th>
                                    <th className="p-1 border">Text</th>
                                    <th className="p-1 border">Amount</th>
                                    <th className="p-1 border">From</th>
                                    <th className="p-1 border">To</th>
                                </tr>
                            </thead>
                            <tbody>
                                {guessedLinkTransactions.map(lt => {
                                    const isLinked = transaction.linkedTransactions.some(l => l.linkedId === lt.id);
                                    const linkType = transaction.linkedTransactions.find(l => l.linkedId === lt.id)?.linkType || "unknown";
                                    const handleLinkClick = () => {
                                        if (isLinked) {
                                            unsetTransactionLink(transaction, lt);
                                        } else {
                                            setTransactionLink(transaction, lt);
                                        }
                                    };
                                    return (
                                        <tr key={lt.id} className="even:bg-gray-800">
                                            <td className="p-1 border flex flex-row items-center gap-2">
                                                <button
                                                    className={
                                                        isLinked
                                                            ? "bg-green-700 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                                                            : "bg-blue-700 text-white px-2 py-1 rounded text-xs hover:bg-blue-800"
                                                    }
                                                    onClick={handleLinkClick}
                                                >
                                                    {isLinked ? "Unlink" : "Link"}
                                                </button>
                                                {isLinked && (
                                                    <select
                                                        className="ml-2 border rounded text-xs bg-gray-800 text-white px-1 py-0.5"
                                                        value={linkType}
                                                        onChange={e => setTransactionLinkType(transaction, lt, e.target.value as LinkType)}
                                                    >
                                                        <option value="unknown">unknown</option>
                                                        <option value="transfer">transfer</option>
                                                        <option value="refund">refund</option>
                                                    </select>
                                                )}
                                            </td>
                                            <td className="p-1 border">{lt.date.format("YYYY-MM-DD")}</td>
                                            <td className="p-1 border">{lt.text}</td>
                                            <td className="p-1 border">{lt.amount}</td>
                                            <td className="p-1 border">{lt.mappedFrom || lt.from}</td>
                                            <td className="p-1 border">{lt.mappedTo || lt.to}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-xs text-gray-300 italic">No linked transactions.</div>
                )}
            </td>
        </tr>
    );
};

export default TransactionRow;