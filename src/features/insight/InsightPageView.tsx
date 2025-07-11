import React, {PropsWithChildren, use, useState} from "react";
import {formatCurrency, formatEnvelope} from "@/utility/datautils";
import CategoryInsights from "@/features/insight/CategoryInsights";
import {InsightsContext} from "@/features/insight/InsightPage";
import {Transaction} from "@/model";
import SingleLineChart from "@/components/SingleLineChart";
import TransactionTable from "@/features/transaction/TransactionTable";
import Chip from "@/components/Chip";

const InsightPageView = () => {
    const {transactionsByEnvelope, categoriesSortedByMonthlyCost, averages, envelopes, setSelectedCategories, selectedCategories} = use(InsightsContext);

    return <div className={"p-2 bg-gradient-to-b from-gray-950 to-[#0a0a0a] flex flex-col gap-8 pt-4"}>
        <div className="gap-4">
            <div className={"flex flex-row gap-4"}>
                <InsightCard>
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
                </InsightCard>

                <InsightCard className={"flex-grow"}>
                    <div className={"flex flex-wrap gap-2 pb-2"}>
                        {categoriesSortedByMonthlyCost.map((category) => (
                            <Chip
                                key={category}
                                label={category}
                                selected={selectedCategories.includes(category)}
                                onClick={() => {
                                    if (selectedCategories.includes(category)) {
                                        setSelectedCategories(selectedCategories.filter(c => c !== category));
                                    } else {
                                        setSelectedCategories([...selectedCategories, category]);
                                    }
                                }}
                            />
                        ))}
                    </div>
                    <div className={"flex flex-1 flex-grow"}>
                        <CategoryInsights/>
                    </div>
                </InsightCard>

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
}


const EnvelopeInsight = ({month, transactions, categoryTotals, net, income, expenses}: MonthInsightProps) => {
    return <MonthInsightsTable {...{month, transactions: transactions, categoryTotals, net: net, income, expenses}}/>
};

interface MonthInsightProps {
    month: string,
    transactions: Transaction[],
    categoryTotals: Record<string, number>;
    net: number;
    income: number;
    expenses: number;
}


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

const InsightCard = ({children, className}: PropsWithChildren<{
    className?: React.HTMLAttributes<HTMLDivElement>['className']
}>) => {
    return <div className={`bg-zinc-900 text-zinc-100 p-4 flex flex-col rounded-2xl shadow-xl ${className}`}>
        {children}
    </div>
}


export default InsightPageView;
