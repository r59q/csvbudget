import React from 'react';
import {useTransactionsContext} from "@/context/TransactionsContext";
import {parseEnvelopeToDate, transactionsSortedByDate} from "@/utility/datautils";
import IncomeChart from "@/features/IncomeChart";
import TransactionTable from "@/features/transaction/TransactionTable";
import {FaRegEnvelopeOpen} from "react-icons/fa6";

const IncomePage = () => {
    const {transactions, envelopes, incomeTransactionsGroupedByEnvelope} = useTransactionsContext();

    const incomeTransactions = transactions.filter(row => row.type === "income");
    const incomeEnvelopes = Object.keys(incomeTransactionsGroupedByEnvelope);
    const averageIncome = incomeEnvelopes.map(month => {
        const incomeRows = incomeTransactionsGroupedByEnvelope[month] ?? [];
        return incomeRows.map(row => row.amount).reduce((pre, cur) => pre + cur, 0);
    }).reduce((pre, cur) => pre + cur, 0) / incomeEnvelopes.length

    // Prepare data for SingleLineChart: one point per envelope (month)
    const chartData = envelopes.map(envelope => {
        const rows = incomeTransactionsGroupedByEnvelope[envelope] ?? [];
        return {
            value: rows.reduce((sum, row) => sum + row.amount, 0),
            date: parseEnvelopeToDate(envelope)?.valueOf() ?? 0,
        };
    }).filter(d => d.value > 0 && d.date > 0);

    const incomeTransactionsSorted = [...incomeTransactions].toSorted(transactionsSortedByDate);

    return (
        <div className={"p-4 bg-gradient-to-b from-gray-950 to-[#0a0a0a]"}>
            <div
                className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-950/20 to-blue-900/40 border border-blue-900 text-blue-100 flex items-start gap-7">
                <FaRegEnvelopeOpen size={40} className="self-center text-blue-300"/>
                <div>
                    <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">About Envelopes</h2>
                    <p className="mb-1">Each income is assigned to an <span
                        className="font-semibold">envelope</span> (month) for accurate budgeting and reporting.</p>
                    <p className="mb-0 text-gray-400">Assigning income to the right envelope helps keep your monthly
                        overview clear and correct.</p>
                    <div className="mt-2 bg-blue-950/30 border border-blue-900 rounded p-3 text-blue-200 text-sm">
                        <span className="font-semibold">Example:</span> If your salary is paid on the last bank day of
                        the month (e.g., January 31st), it is assigned to the <span className="font-semibold">next month's envelope</span> (February).
                        This ensures your income is matched to the month it is used for budgeting.
                    </div>
                </div>
            </div>
            <IncomeChart averageIncome={averageIncome} chartData={chartData}/>
            <TransactionTable pageSize={20} transactions={incomeTransactionsSorted}
                              visibleColumns={["date", "text", "amount", "envelope"]}/>
        </div>
    );

};

export default IncomePage;