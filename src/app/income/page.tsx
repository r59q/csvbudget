"use client";

import useOwnedAccounts from "@/hooks/OwnedAccount";
import useIncomeMapping from "@/hooks/Income";
import {formatDayjsToDate, formatEnvelope, groupByDateMonth, transactionsSortedByDate} from "@/utility/datautils";
import {TransactionsProvider, useTransactionsContext} from "@/context/TransactionsContext";
import {Envelope} from "@/model";
import IncomeChart from "@/features/IncomeChart";
import TransactionTable from "@/features/transaction/TransactionTable";


const Page = () => {
    return (
        <TransactionsProvider>
            <IncomePage/>
        </TransactionsProvider>
    );
};

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
            date: rows[0]?.date ? rows[0].date.valueOf() : 0 // Convert Dayjs to millis
        };
    }).filter(d => d.value > 0 && d.date > 0);

    const incomeTransactionsSorted = [...incomeTransactions].toSorted(transactionsSortedByDate);

    return (
        <div className={"p-2"}>
            <IncomeChart averageIncome={averageIncome} chartData={chartData}/>
            <TransactionTable pageSize={20} transactions={incomeTransactionsSorted} visibleColumns={["date", "text", "amount", "envelope"]}/>
        </div>
    );
};

export default Page;
