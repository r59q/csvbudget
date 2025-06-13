"use client";
import React, {useMemo, useState} from 'react';
import useBudget from "@/hooks/Budget";
import useIncome from "@/hooks/Income";
import {advancedFilters, formatCurrency, getSum, groupByMonth} from "@/utility/datautils";
import useCategories from "@/hooks/Categories";
import useCSVRows from "@/hooks/CSVRows";
import {MappedCSVRow} from "@/model";
import dayjs from "dayjs";
import useOwnedAccounts from "@/hooks/OwnedAccount";

export default function BudgetPage() {
    const {budgetPosts, createBudgetPost, deleteBudgetPost, saveBudgetPosts} = useBudget();
    const {mappedCSVRows} = useCSVRows();
    const {groupByCategory, getCategory, categories} = useCategories();
    const {incomeRows} = useIncome();
    const {isAccountOwned} = useOwnedAccounts();

    const [newTitle, setNewTitle] = useState("");
    const [newAmount, setNewAmount] = useState<number>(0);

    const filteredRows: MappedCSVRow[] = useMemo(() => mappedCSVRows.filter(e => {
        return !(isAccountOwned(e.mappedFrom) && isAccountOwned(e.mappedTo));
    }).filter(advancedFilters).toSorted((a, b) => {
        const aDate = dayjs(a.mappedDate, 'DD-MM-YYYY');
        const bDate = dayjs(b.mappedDate, 'DD-MM-YYYY');
        return bDate.unix() - aDate.unix()
    }), [mappedCSVRows, isAccountOwned])

    const groupedByMonth: Record<string, MappedCSVRow[] | undefined> = useMemo(() => Object.groupBy(filteredRows, row => {
        return dayjs(row.mappedDate, 'DD-MM-YYYY').format("MMMM YYYY");
    }), [filteredRows]);
    const months = Object.keys(groupedByMonth).filter(e => e !== "");

    const monthlyTotals: MonthlyTotals = useMemo(() => {
        return computeMonthlyTotals(months, groupedByMonth, getCategory);
    }, [mappedCSVRows, months])


    const total = useMemo(() => months.reduce((pre, cur) => {
        return monthlyTotals.totals[cur] + pre;
    }, 0), [monthlyTotals, months])

    if (filteredRows.length === 0) {
        return <></>
    }

    const latestDate = dayjs(filteredRows[0].mappedDate, 'DD-MM-YYYY');
    const earliestDate = dayjs(filteredRows[filteredRows.length - 1].mappedDate, 'DD-MM-YYYY');
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

    const incomePerMonth = groupByMonth(incomeRows);
    const incomeMonths = Object.keys(incomePerMonth);
    const totalIncome = incomeMonths.reduce((pre, cur) => pre + getSum(incomePerMonth[cur] ?? []), 0);
    const averageIncomePerMonth = totalIncome / incomeMonths.length;
    const averageIncomePerDay = totalIncome / durationDays;

    const totalBudget = budgetPosts.reduce((acc, post) => acc + post.amount, 0);

    const categoriesSortedByMonthlyCost = [...categories]
        .toSorted((a, b) => monthlyAverageExpensesPerCategory[b] - monthlyAverageExpensesPerCategory[a]);


    const handleCreatePost = () => {
        if (!newTitle || newAmount === 0) return;
        createBudgetPost({title: newTitle, amount: newAmount});
        setNewTitle("");
        setNewAmount(0);
    };

    const handleRenameTitle = (index: number, newTitle: string) => {
        const updatedPosts = [...budgetPosts];
        updatedPosts[index] = {
            ...updatedPosts[index],
            title: newTitle,
        };
        saveBudgetPosts(updatedPosts);
    };

    const handleUpdateAmount = (index: number, newAmount: number) => {
        const updatedPosts = [...budgetPosts];
        updatedPosts[index] = {
            ...updatedPosts[index],
            amount: newAmount,
        };
        saveBudgetPosts(updatedPosts);
    };

    return (
        <div className="min-h-screen text-gray-100 w-full">
            <div className="p-4 space-y-6 flex flex-col justify-center items-center flex-grow">
                <h1 className="text-3xl font-bold">Budget Overview</h1>

                {/* Income Summary */}
                <section className="bg-gray-800 p-4 rounded-xl w-1/3">
                    <h2 className="text-xl font-semibold mb-2">Income Summary</h2>
                    <p className="text-green-400 font-medium">
                        Total Income: {formatCurrency(averageIncomePerMonth)}
                    </p>
                </section>

                {/* Add Budget Post */}
                <section className="bg-gray-800 p-4 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Add Budget Post</h2>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            placeholder="Title"
                            className="border border-gray-600 bg-gray-700 text-white p-2 rounded w-full"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Amount"
                            className="border border-gray-600 bg-gray-700 text-white p-2 rounded w-full sm:w-40"
                            value={newAmount}
                            onChange={(e) => setNewAmount(parseFloat(e.target.value))}
                        />
                        <button
                            onClick={handleCreatePost}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Add
                        </button>
                    </div>
                </section>

                {/* Budget Posts List */}
                <section className="w-full flex gap-2 flex-row">
                    <div className={"flex-1/4"}></div>
                    <div className="flex-1/3 bg-gray-800 p-4 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Budget Posts</h2>
                        {budgetPosts.length === 0 ? (
                            <p className="text-gray-400">No budget posts yet.</p>
                        ) : (
                            <ul className="divide-y divide-gray-700">
                                {budgetPosts.map((post, index) => (
                                    <li key={index} className="py-3 space-y-2">
                                        <div
                                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                            <input
                                                type="text"
                                                className="bg-gray-700 border border-gray-600 text-white p-2 rounded w-full sm:w-2/3"
                                                value={post.title}
                                                onChange={(e) => handleRenameTitle(index, e.target.value)}
                                            />
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="number"
                                                    className="bg-gray-700 border border-gray-600 text-white p-2 rounded w-28 font-mono"
                                                    value={post.amount}
                                                    onChange={(e) => handleUpdateAmount(index, parseFloat(e.target.value))}
                                                />
                                                <button
                                                    onClick={() => deleteBudgetPost(post)}
                                                    className="text-red-400 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                    </div>
                    <div className={"flex-1/4"}></div>

                </section>

                {/* Summary */}
                <section className="w-full flex gap-2 flex-row">
                    <div className={"bg-gray-800 p-4 rounded-xl flex-1/4"}></div>
                    <div className={"bg-gray-800 p-4 rounded-xl flex-1/3"}>
                        <h2 className="text-xl font-semibold mb-2">Summary</h2>
                        <p>
                            Budgeted Total:{" "}
                            <span className="font-semibold">${totalBudget.toFixed(2)}</span>
                        </p>
                        <p>
                            Remaining:{" "}
                            <span
                                className={`font-semibold ${
                                    averageIncomePerMonth - totalBudget < 0
                                        ? "text-red-400"
                                        : "text-green-400"
                                }`}
                            >
                            ${(averageIncomePerMonth - totalBudget).toFixed(2)}
                        </span>
                        </p>
                    </div>
                    <div className={"flex-1/4"}>

                    </div>
                </section>
            </div>
        </div>
    );
}

interface MonthlyTotals {
    categoryTotals: Record<string, Record<string, number>>;
    totals: Record<string, number>;
}

const computeMonthlyTotals = (months: string[], groupedByMonth: Record<string, MappedCSVRow[] | undefined>, getCategory: (row: MappedCSVRow) => string | undefined): MonthlyTotals => {
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
            const category = getCategory(row) || "Unassigned";
            const num = row.mappedAmount;
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
