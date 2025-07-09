import React from 'react';
import {useTransactionsContext} from "@/context/TransactionsContext";
import {parseEnvelopeToDate, transactionsSortedByDate} from "@/utility/datautils";
import IncomeChart from "@/features/IncomeChart";
import TransactionTable from "@/features/transaction/TransactionTable";
import InfoBox from "@/components/InfoBox";
import {FaRegEnvelopeOpen} from "react-icons/fa6";

const IncomePage = () => {
    const {transactions, envelopes, incomeTransactionsGroupedByEnvelope} = useTransactionsContext();

    const incomeTransactions = transactions.filter(row => row.type === "income");
    const incomeEnvelopes = Object.keys(incomeTransactionsGroupedByEnvelope);
    const averageIncome = incomeEnvelopes.map(month => {
        const incomeRows = incomeTransactionsGroupedByEnvelope[month] ?? [];
        return incomeRows.map(row => row.amountAfterRefund).reduce((pre, cur) => pre + cur, 0);
    }).reduce((pre, cur) => pre + cur, 0) / incomeEnvelopes.length

    // Prepare data for SingleLineChart: one point per envelope (month)
    const chartData = envelopes.map(envelope => {
        const rows = incomeTransactionsGroupedByEnvelope[envelope] ?? [];
        return {
            value: rows.reduce((sum, row) => sum + row.amountAfterRefund, 0),
            date: parseEnvelopeToDate(envelope)?.valueOf() ?? 0,
        };
    }).filter(d => d.value > 0 && d.date > 0);

    const incomeTransactionsSorted = [...incomeTransactions].toSorted(transactionsSortedByDate);

    return (
        <div className={"p-4 bg-gradient-to-b from-gray-950 to-[#0a0a0a]"}>
            <InfoBox
                icon={<FaRegEnvelopeOpen size={40} />}
                title="About Envelopes"
                description={<>Each income is assigned to an <span className="font-semibold">envelope</span> (month) for accurate budgeting and reporting.</>}
                secondary={<>Assigning income to the right envelope helps keep your monthly overview clear and correct.</>}
                tip={<><span className="font-semibold">Example:</span> If your salary is paid on the last bank day of the month (e.g., January 31st), it is assigned to the <span className="font-semibold">next month&apos;s envelope</span> (February). This ensures your income is matched to the month it is used for budgeting.</>}
            />
            <IncomeChart averageIncome={averageIncome} chartData={chartData}/>
            <TransactionTable pageSize={20} transactions={incomeTransactionsSorted}
                              visibleColumns={["date", "text", "amount", "type", "envelope"]}/>
        </div>
    );

};

export default IncomePage;