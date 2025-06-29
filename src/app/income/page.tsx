"use client";

import useOwnedAccounts from "@/hooks/OwnedAccount";
import useIncome from "@/hooks/Income";
import {
    formatCurrency,
    formatDayjsToDate,
    formatEnvelope,
    groupByDateMonth,
    transactionsSortedByDate
} from "@/utility/datautils";
import {TransactionsProvider, useTransactionsContext} from "@/context/TransactionsContext";
import {Envelope, Transaction} from "@/model";


const Page = () => {
    return (
        <TransactionsProvider>
            <IncomePage/>
        </TransactionsProvider>
    );
};

const IncomePage = () => {
    const {transactions, envelopes} = useTransactionsContext();
    const {filterInterAccountTransaction} = useOwnedAccounts();
    const {getEnvelopeForIncome, setEnvelopeForIncome} = useIncome();

    const incomeTransactions = transactions.filter(row => row.type === "income");

    const unfilteredRows = incomeTransactions.filter(e => filterInterAccountTransaction(e)).filter(row => row.amount > 0).sort(transactionsSortedByDate);

    const transactionsByMonth = groupByDateMonth(unfilteredRows);

    const monthlyIncomeRows: Partial<Record<Envelope, Transaction[]>> = Object.groupBy(incomeTransactions, row => getEnvelopeForIncome(row.id));
    const incomeMonths = Object.keys(monthlyIncomeRows);
    const averageIncome = incomeMonths.map(month => {
        const incomeRows = monthlyIncomeRows[month] ?? [];
        return incomeRows.map(row => row.amount).reduce((pre, cur) => pre + cur, 0);
    }).reduce((pre, cur) => pre + cur, 0) / incomeMonths.length

    return (
        <div className={"p-2"}>
            <div>
                <p>Average Income: {formatCurrency(averageIncome)}</p>
                {envelopes.map(month => {
                    const rows = monthlyIncomeRows[month];
                    if (!rows) return null;
                    return <div key={month}>
                        <p>{month}</p>
                        {rows.map(row => <span
                            key={row.id}>
                        {formatCurrency(row.amount)}
                    </span>)}
                    </div>;
                })}
            </div>

            {envelopes.map(envelope => {
                const rows = transactionsByMonth[envelope];
                if (!rows) return null;
                return <div className={"flex flex-col gap-2 mt-4"} key={envelope}>
                    <p className={"text-2xl"}>{formatEnvelope(envelope)}</p>
                    <table>
                        <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-2 border-b border-gray-700">Date</th>
                            <th className="px-4 py-2 border-b border-gray-700">Posting</th>
                            <th className="px-4 py-2 border-b border-gray-700 text-right">Amount</th>
                            <th className="px-4 py-2 border-b border-gray-700">Assigned Month</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((transaction) => {
                            const transactionEnvelope: Envelope = getEnvelopeForIncome(transaction.id);
                            return (
                                <tr key={transaction.id}
                                    className="hover:bg-gray-800 transition-colors duration-150">
                                    <td className="px-4 py-2 border-b border-gray-700">
                                        {formatDayjsToDate(transaction.date)}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-700">
                                        {transaction.text}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-700 text-right">
                                        {transaction.amount}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-700">
                                        <div className={"flex flex-row"}>
                                            <select
                                                className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                onClick={(e) => e.stopPropagation()}
                                                value={transactionEnvelope}
                                                onChange={(e) => setEnvelopeForIncome(transaction, e.target.value)}>
                                                <option value="Unassigned">Unassigned</option>
                                                {envelopes.map((opt) => (
                                                    <option key={opt} value={opt}>
                                                        {formatEnvelope(opt)}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                className="ml-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                                onClick={() => setEnvelopeForIncome(transaction, transaction.guessedEnvelope)}
                                                disabled={!transaction.guessedEnvelope || transactionEnvelope === transaction.guessedEnvelope}
                                                title={transactionEnvelope === formatEnvelope(transaction.guessedEnvelope) ? 'Already assigned' : 'Assign to guessed envelope'}
                                            >
                                                {envelope === transaction.guessedEnvelope ? "This month" : "Next month"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            })}

        </div>
    );
};

export default Page;