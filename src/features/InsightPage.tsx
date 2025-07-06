import {useTransactionsContext} from "@/context/TransactionsContext";
import useCategories from "@/hooks/Categories";
import useAverages from "@/hooks/Averages";
import {Category, Envelope, Transaction, TransactionID} from "@/model";
import {formatCurrency, formatDayjsToDate, formatEnvelope, groupByEnvelope} from "@/utility/datautils";
import React, {createContext, useState} from "react";
import SingleLineChart from "@/components/SingleLineChart";
import TransactionTable from "@/features/transaction/TransactionTable";

interface InsightsContextType {
    getCategory: (transactionId: TransactionID) => Category;
}

interface MonthlyTotals {
    categoryTotals: Record<string, Record<string, number>>;
    totals: Record<string, number>;
}

const InsightsContext = createContext<InsightsContextType>(null!)

const InsightPage = () => {
    const {envelopes, envelopeSelectedTransactions} = useTransactionsContext();
    const {getCategory, categories} = useCategories();
    const averages = useAverages(envelopeSelectedTransactions);

    const transactionsByEnvelope: Partial<Record<Envelope, Transaction[]>> = groupByEnvelope(envelopeSelectedTransactions);

    // For sorting categories by average expense
    const categoriesSortedByMonthlyCost = [...averages.categories]
        .toSorted((a, b) => (averages.averageExpenseByCategoryPerEnvelope[a] ?? 0) - (averages.averageExpenseByCategoryPerEnvelope[b] ?? 0));

    if (envelopeSelectedTransactions.length === 0) {
        return <>NO ENVELOPES SELECTED!!</>
    }

    return (
        <InsightsContext.Provider value={{getCategory}}>
            <div className={"p-2 flex flex-col gap-8 pt-4"}>
                <div className="gap-4">
                    <div className={"flex flex-row"}>
                        <div className="bg-zinc-900 text-zinc-100 p-6 rounded-2xl shadow-xl space-y-6">
                            {/* Section: Expenses */}
                            <section>
                                <h3 className="text-lg font-semibold text-red-400 mb-3">Expenses</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <span className="text-zinc-400">Monthly</span>
                                    <span
                                        className="text-right">{formatCurrency(averages.averageExpensePerEnvelope)}</span>
                                </div>
                                <hr/>
                                <div>
                                    <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                                        <span className="text-zinc-400">Category</span>
                                        <span className="text-right text-zinc-400">Monthly Average</span>
                                        {categoriesSortedByMonthlyCost.map((category) => (
                                            <React.Fragment key={category}>
                                                <span>{category}</span>
                                                <span className="text-right">
                                                    {formatCurrency(averages.averageExpenseByCategoryPerEnvelope[category] ?? 0)}
                                                </span>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            </section>
                            {/* Section: Income */}
                            <section>
                                <h3 className="text-lg font-semibold text-green-400 mb-3">Income</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <span className="text-zinc-400">Monthly</span>
                                    <span
                                        className="text-right">{formatCurrency(averages.averageIncomePerEnvelope)}</span>
                                </div>
                            </section>
                            {/* Section: Net */}
                            <section>
                                <h3 className="text-lg font-semibold text-blue-400 mb-3">Net</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <span className="text-zinc-400">Monthly</span>
                                    <span className="text-right">{formatCurrency(averages.averageNetPerEnvelope)}</span>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                <div>
                    {envelopes.map(envelope => {
                        const envelopeTransactions = transactionsByEnvelope[envelope];
                        if (!envelopeTransactions) return <React.Fragment key={envelope}></React.Fragment>;
                        const envelopeStats = averages.envelopeStats[envelope] || {
                            income: 0,
                            expenses: 0,
                            net: 0,
                            expensesByCategory: {}
                        };
                        return <div key={envelope}>
                            <p>{formatEnvelope(envelope)}</p>
                            <EnvelopeInsight {...{month: envelope}}
                                             transactions={envelopeTransactions}
                                             income={envelopeStats.income}
                                             expenses={envelopeStats.expenses}
                                             categoryTotals={envelopeStats.expensesByCategory}
                                             net={envelopeStats.net}/>
                        </div>
                    })}
                </div>
            </div>
        </InsightsContext.Provider>
    );
};


interface MonthInsightProps {
    month: string,
    transactions: Transaction[],
    categoryTotals: Record<string, number>;
    net: number;
    income: number;
    expenses: number;
}

const EnvelopeInsight = ({month, transactions, categoryTotals, net, income, expenses}: MonthInsightProps) => {
    return <MonthInsightsTable {...{month, transactions: transactions, categoryTotals, net: net, income, expenses}}/>
};

const MonthInsightsTable = ({
                                transactions,
                                net,
                                categoryTotals,
                                income,
                                expenses
                            }: Pick<MonthInsightProps, 'month' | "transactions" | 'net' | 'categoryTotals' | "income" | "expenses">) => {
    const [open, setOpen] = useState(false);
    const expenseTransactions = transactions.filter(tran => tran.type === "income" || tran.type === "expense")
        .toSorted((a, b) => a.date.valueOf() - b.date.valueOf());

    let balance = 0;
    const burndownChart = expenseTransactions.map((tran) => {
        balance += tran.amount;
        return {
            value: balance,
            date: tran.date.valueOf()
        };
    });


    return (
        <div className="rounded-xl shadow p-4 mb-6 bg-gray-800">
            <button
                className="flex items-center justify-between w-full text-left text-lg font-semibold text-gray-300 hover:text-white"
                onClick={() => setOpen(!open)}>
                <span className={"text-sm"}>Transactions</span>
                <div className={"items-center flex flex-row gap-8"}>
                    <span className={"text-green-600"}>{income}</span>
                    <span className={"text-red-600"}>{expenses}</span>
                    <span className={"text-blue-600"}>{income + expenses}</span>
                    <span className="text-sm">{open ? "▼" : "►"}</span>
                </div>
            </button>

            {open && (
                <div className="mt-4 transition-all duration-300">
                    <div className="overflow-x-auto mb-4">
                        <div className={"flex w-full"}>
                            <SingleLineChart data={burndownChart} zero={net}/>
                        </div>
                        <TransactionTable transactions={transactions} pageSize={9999} compact
                                          visibleColumns={["date", "text", "amount", "category"]}/>
                    </div>

                    <div className="border-t border-gray-600 pt-2">
                        <MonthInsightsTableTotals {...{categoryTotals, net}}/>
                    </div>
                </div>
            )}
        </div>
    );
}

interface MonthInsightsTableRowProps {
    transaction: Transaction;
    category: string | undefined;
}

const MonthInsightsTableRow = ({transaction, category}: MonthInsightsTableRowProps) => {
    return (
        <tr className="even:bg-gray-700 hover:bg-gray-900">
            <td className="px-4 py-2 border-b">{formatDayjsToDate(transaction.date)}</td>
            <td className="px-4 py-2 border-b">{transaction.text}</td>
            <td className="px-4 py-2 border-b">{category}</td>
            <td className="px-4 py-2 border-b text-right">
                {transaction.amount}
            </td>
        </tr>
    );
};

interface MonthInsightsTableTotalsProps {
    categoryTotals: Record<string, number>;
    net: number;
}

const MonthInsightsTableTotals = ({
                                      categoryTotals,
                                      net,
                                  }: MonthInsightsTableTotalsProps) => {
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const maxAbs = Math.max(...Object.values(categoryTotals).map(Math.abs), 1); // Avoid div/0

    return (
        <>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Category Totals</h3>
            <ul className="space-y-1 text-sm text-gray-300">
                {sorted.map(([category, total]) => (
                    <li
                        key={category}
                        className="flex justify-between border-b border-gray-700 pb-1"
                    >
                        <span>{category}</span>
                        <span style={{color: getHeatColor(total, maxAbs)}}>
              {formatCurrency(total)}
            </span>
                    </li>
                ))}
                <li className="flex justify-between font-semibold text-gray-200 pt-2 border-t border-gray-700 mt-2">
                    <span>Total</span>
                    <span>{formatCurrency(net)}</span>
                </li>
            </ul>
        </>
    );
};

const getHeatColor = (value: number, maxAbs: number) => {
    const intensity = Math.min(Math.abs(value) / maxAbs, 1); // 0 - 1
    const red = Math.round(255 * intensity);
    const white = 255 - red;
    return `rgb(255, ${white}, ${white})`; // white to red gradient
};

const computeMonthlyTotals = (months: string[], groupedByMonth: Partial<Record<Envelope, Transaction[]>>, getCategory: (transactionId: TransactionID) => Category): MonthlyTotals => {
    const totals: Record<string, number> = {};
    const monthlyCategoryTotals: Record<string, Record<string, number>> = {};

    months.forEach(month => {
        const rows = groupedByMonth[month];
        if (!rows) return;

        const categoryTotals: Record<string, number> = {};
        let totalSum = 0;

        rows.forEach((row) => {
            if (!categoryTotals) {
                throw new Error("wa")
            }
            const category = getCategory(row.id);
            const num = row.amount;
            if (!isNaN(num)) {
                categoryTotals[category] = (categoryTotals[category] || 0) + num;
                totalSum += num;
            }
        });
        totals[month] = totalSum;
        monthlyCategoryTotals[month] = categoryTotals;
    })
    return {totals, categoryTotals: monthlyCategoryTotals};
};

export default InsightPage;
