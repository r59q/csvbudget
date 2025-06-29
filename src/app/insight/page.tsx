"use client";
import React, {createContext, use, useMemo, useState} from 'react';
import {advancedFilters, formatCurrency, formatDayjs, getSum, groupByEnvelope} from "@/utility/datautils";
import useCSVRows from "@/hooks/CSVRows";
import useCategories from "@/hooks/Categories";
import useOwnedAccounts from "@/hooks/OwnedAccount";
import {Category, Envelope, Transaction, TransactionID} from '@/model';
import BurndownChart from "@/components/BurndownChart";
import {TransactionsProvider, useTransactionsContext} from "@/context/TransactionsContext";

interface InsightsContextType {
    getCategory: (transactionId: TransactionID) => Category;
}

interface MonthlyTotals {
    categoryTotals: Record<string, Record<string, number>>;
    totals: Record<string, number>;
}

const InsightsContext = createContext<InsightsContextType>(null!)


const Page = () => {
    return (
        <TransactionsProvider>
            <InsightPage/>
        </TransactionsProvider>
    );
};

const InsightPage = () => {
    const {mappedCSVRows} = useCSVRows();
    const {transactions} = useTransactionsContext();
    const {getCategory, categories} = useCategories();
    const {isAccountOwned} = useOwnedAccounts();

    const incomeRows = transactions.filter(tran => tran.type === "income");

    const filteredTransactions: Transaction[] = useMemo(() => transactions.filter(e => {
        return !(isAccountOwned(e.from) && isAccountOwned(e.to));
    }).filter(advancedFilters).toSorted((a, b) => {
        const aDate = a.date;
        const bDate = b.date;
        return bDate.unix() - aDate.unix()
    }), [mappedCSVRows, isAccountOwned])

    const groupedByEnvelope: Partial<Record<Envelope, Transaction[]>> = useMemo(() => Object.groupBy(filteredTransactions, row => {
        return row.envelope;
    }), [filteredTransactions]);
    const months = Object.keys(groupedByEnvelope).filter(e => e !== "");

    const monthlyTotals: MonthlyTotals = useMemo(() => {
        return computeMonthlyTotals(months, groupedByEnvelope, getCategory);
    }, [mappedCSVRows, months, getCategory])


    const total = useMemo(() => months.reduce((pre, cur) => {
        return monthlyTotals.totals[cur] + pre;
    }, 0), [monthlyTotals, months])

    if (filteredTransactions.length === 0) {
        return <></>
    }

    const latestDate = filteredTransactions[0].date;
    const earliestDate = filteredTransactions[filteredTransactions.length - 1].date;
    const durationDays = latestDate.diff(earliestDate, 'days');
    const dailyAverageExpenses = total / durationDays;
    const monthlyAverageExpenses = total / months.length;
    const monthlyAverageExpensesPerCategory: Record<string, number> = {};
    categories.forEach(category => {
        const monthly = months.map(month => {
            return monthlyTotals.categoryTotals[month][category];
        });
        const total = monthly.reduce((pre, cur) => {
            if (isNaN(cur)) return pre;
            return pre + cur
        }, 0);
        monthlyAverageExpensesPerCategory[category] = total / months.length;
    })

    const incomePerMonth = groupByEnvelope(incomeRows);
    const incomeMonths = Object.keys(incomePerMonth);
    const totalIncome = incomeMonths.reduce((pre, cur) => pre + getSum(incomePerMonth[cur] ?? []), 0);
    const averageIncomePerMonth = totalIncome / incomeMonths.length;
    const averageIncomePerDay = totalIncome / durationDays;

    const categoriesSortedByMonthlyCost = [...categories]
        .toSorted((a, b) => monthlyAverageExpensesPerCategory[b] - monthlyAverageExpensesPerCategory[a]);

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
                                    <span className="text-zinc-400">Daily</span>
                                    <span className="text-right">{formatCurrency(dailyAverageExpenses)}</span>
                                    <span className="text-zinc-400">Monthly</span>
                                    <span className="text-right">{formatCurrency(monthlyAverageExpenses)}</span>
                                </div>

                                <hr/>

                                <div>
                                    <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                                        <span className="text-zinc-400">Category</span>
                                        <span className="text-right text-zinc-400">Monthly Average</span>
                                        {categoriesSortedByMonthlyCost.map((category) => (
                                            <React.Fragment key={category}>
                                                <span>{category}</span>
                                                <span
                                                    className="text-right">{formatCurrency(monthlyAverageExpensesPerCategory[category])}</span>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Section: Income */}
                            <section>
                                <h3 className="text-lg font-semibold text-green-400 mb-3">Income</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <span className="text-zinc-400">Daily</span>
                                    <span className="text-right">{formatCurrency(averageIncomePerDay)}</span>
                                    <span className="text-zinc-400">Monthly</span>
                                    <span className="text-right">{formatCurrency(averageIncomePerMonth)}</span>
                                </div>
                            </section>

                            {/* Section: Net */}
                            <section>
                                <h3 className="text-lg font-semibold text-blue-400 mb-3">Net</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <span className="text-zinc-400">Daily</span>
                                    <span
                                        className="text-right">{formatCurrency(averageIncomePerDay + dailyAverageExpenses)}</span>
                                    <span className="text-zinc-400">Monthly</span>
                                    <span
                                        className="text-right">{formatCurrency(averageIncomePerMonth + monthlyAverageExpenses)}</span>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                <div>
                    {months.map(month => {
                        const rows = groupedByEnvelope[month];
                        if (!rows) return null;
                        return <div key={month}>
                            <p>{month}</p>
                            <MonthInsight {...{month, rows}}
                                          income={getSum(incomePerMonth[month] ?? [])}
                                          categoryTotals={monthlyTotals.categoryTotals[month]}
                                          totalSum={monthlyTotals.totals[month]}/>
                        </div>
                    })}
                </div>
            </div>
        </InsightsContext.Provider>
    );
};

interface MonthInsightProps {
    month: string,
    rows: Transaction[],
    categoryTotals: Record<string, number>;
    totalSum: number;
    income: number;
}

const MonthInsight = ({month, rows, categoryTotals, totalSum, income}: MonthInsightProps) => {
    return <MonthInsightsTable {...{month, rows, categoryTotals, totalSum, income}}/>
};

const MonthInsightsTable = ({
                                rows,
                                totalSum,
                                categoryTotals,
                                income
                            }: Pick<MonthInsightProps, 'month' | "rows" | 'totalSum' | 'categoryTotals' | "income">) => {
    const {getCategory} = use(InsightsContext);
    const [open, setOpen] = useState(false);
    const firstOfMonth = rows[rows.length - 1];
    const firstDateOfMonth = firstOfMonth.date

    const burndown: {
        value: number,
        date: number
    }[] = [{
        value: income,
        date: firstDateOfMonth.toDate().getTime()
    }];

    [...rows].reverse().forEach((row, idx) => {
        burndown.push({
            date: row.date.toDate().getTime(),
            value: burndown[idx].value + row.amount
        });
    })
    const expenses = getSum(rows);

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
                            <BurndownChart burndown={burndown}/>
                        </div>
                        <table className="w-full text-sm text-left text-gray-300 border border-gray-700 rounded-lg">
                            <thead className="bg-gray-900 text-gray-500 font-semibold">
                            <tr>
                                <th className="px-4 py-2 border-b">Date</th>
                                <th className="px-4 py-2 border-b">Posting</th>
                                <th className="px-4 py-2 border-b">Category</th>
                                <th className="px-4 py-2 border-b text-right">Amount</th>
                            </tr>
                            </thead>
                            <tbody>
                            {rows.map((row) => {
                                const category = getCategory(row.id);
                                return <MonthInsightsTableRow {...{row, category}} key={row.id}/>
                            })}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-gray-600 pt-2">
                        <MonthInsightsTableTotals {...{categoryTotals, totalSum}}/>
                    </div>
                </div>
            )}
        </div>
    );
}

interface MonthInsightsTableRowProps {
    row: Transaction;
    category: string | undefined;
}

const MonthInsightsTableRow = ({row, category}: MonthInsightsTableRowProps) => {
    return (
        <tr className="even:bg-gray-700 hover:bg-gray-900">
            <td className="px-4 py-2 border-b">{formatDayjs(row.date)}</td>
            <td className="px-4 py-2 border-b">{row.text}</td>
            <td className="px-4 py-2 border-b">{category}</td>
            <td className="px-4 py-2 border-b text-right">
                {row.amount}
            </td>
        </tr>
    );
};

interface MonthInsightsTableTotalsProps {
    categoryTotals: Record<string, number>;
    totalSum: number;
}

const MonthInsightsTableTotals = ({
                                      categoryTotals,
                                      totalSum,
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
                    <span>{formatCurrency(totalSum)}</span>
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

export default Page;
