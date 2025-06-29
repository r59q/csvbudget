"use client";
import React, {useMemo, useState} from 'react';
import useBudget from "@/hooks/Budget";
import useIncome from "@/hooks/Income";
import {advancedFilters, formatCurrency, formatMonth, getDayJs, getSum, groupByEnvelope} from "@/utility/datautils";
import useCategories from "@/hooks/Categories";
import useCSVRows from "@/hooks/CSVRows";
import {BudgetPost, Category, CategoryBudgetPostMap, Envelope, MappedCSVRow} from "@/model";
import dayjs from "dayjs";
import useOwnedAccounts from "@/hooks/OwnedAccount";

export default function BudgetPage() {
    const {
        budgetPosts,
        createBudgetPost,
        deleteBudgetPost,
        saveBudgetPosts,
        getBudgetPostForCategory,
        setCategoryBudgetMapping,
        setBudgetPosts,
        setCategoryBudgetMap,
        getCategoriesForPost
    } = useBudget();
    const {mappedCSVRows} = useCSVRows();
    const {groupByCategory, getCategory, categories} = useCategories();
    const {incomeRows} = useIncome();
    const {isAccountOwned} = useOwnedAccounts();

    const [selectedFromMonth, setSelectedFromMonth] = useState<number | undefined>(undefined);
    const [selectedToMonth, setSelectedToMonth] = useState<number | undefined>(undefined);
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

    const incomePerMonth = groupByEnvelope(incomeRows);
    const incomeMonths = Object.keys(incomePerMonth);
    const totalIncome = incomeMonths.reduce((pre, cur) => pre + getSum(incomePerMonth[cur] ?? []), 0);
    const averageIncomePerMonth = totalIncome / incomeMonths.length;
    const averageIncomePerDay = totalIncome / durationDays;

    const totalBudget = budgetPosts.reduce((acc, post) => acc + post.amount, 0);

    const categoriesSortedByMonthlyCost = [...categories]
        .toSorted((a, b) => monthlyAverageExpensesPerCategory[b] - monthlyAverageExpensesPerCategory[a]);


    const isMonthSelected = (month: Envelope) => {
        const idx = months.indexOf(month);
        if (selectedFromMonth === undefined) {
            return true;
        }
        if (selectedToMonth === undefined) {
            return idx >= selectedFromMonth;
        }
        return idx >= selectedFromMonth && idx <= selectedToMonth;
    }
    const dateFilteredMonths = (selectedFromMonth !== undefined && selectedToMonth !== undefined) ? months.filter((_ignored, idx) => idx >= selectedFromMonth && idx <= selectedToMonth) : months
    console.log(dateFilteredMonths)
    const rowsFilteredByDate = (selectedFromMonth !== undefined && selectedToMonth !== undefined) ? filteredRows.filter(e => {
            return dateFilteredMonths.includes(formatMonth(getDayJs(e.mappedDate).toDate()))
        }
    ) : filteredRows

    const dateFilteredGroupedByCategory = groupByCategory(rowsFilteredByDate);
    const groupedByCategory = groupByCategory(filteredRows);
    const averagesByCategory: Record<Category, number> = {}
    categories.forEach(e => averagesByCategory[e] = getSum(groupedByCategory[e] ?? []) / months.length);
    const sortedAveragesByCategory = categories.map(cat => ({
        average: averagesByCategory[cat],
        category: cat
    })).sort((a, b) => a.average - b.average);
    const dateFilteredAveragesByCategory: Record<Category, number> = {}
    categories.forEach(e => dateFilteredAveragesByCategory[e] = getSum(dateFilteredGroupedByCategory[e] ?? []) / dateFilteredMonths.length);
    console.log(dateFilteredGroupedByCategory)

    /*
        const expensesByBudgetPost: Record<BudgetPost["title"], { amount: number, category: Category }[]> = {}
        budgetPosts.map(e => {
            const categories = getCategoriesForPost(e);
            expensesByBudgetPost[e.title] = categories.map(cat => ({amount: averagesByCategory[cat], category: cat}));
        })
    */
    const dateFilteredExpensesByBudgetPost: Record<BudgetPost["title"], { amount: number, category: Category }[]> = {}
    budgetPosts.map(e => {
        const categories = getCategoriesForPost(e);
        dateFilteredExpensesByBudgetPost[e.title] = categories.map(cat => ({
            amount: dateFilteredAveragesByCategory[cat],
            category: cat
        }));
    })

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

    const handleUseExpenseAsBudget = () => {
        const newPosts: BudgetPost[] = []
        const newCategoryBudgetMap: CategoryBudgetPostMap = {}
        categories.forEach(category => {
            const amount = averagesByCategory[category]
            const post = {amount: Math.round(-amount), title: category}
            newPosts.push(post);
            newCategoryBudgetMap[category] = category;
        })
        setBudgetPosts(newPosts);
        setCategoryBudgetMap(newCategoryBudgetMap);
    }

    const handleMonthSelect = (month: Envelope) => {
        const idx = months.indexOf(month);
        if (idx === -1) return;
        if (selectedFromMonth === undefined) {
            setSelectedFromMonth(idx);
            return;
        }
        if (selectedToMonth === undefined) {
            setSelectedToMonth(idx);
            return;
        }
        setSelectedToMonth(undefined)
        setSelectedFromMonth(idx);
    }

    return (
        <div className="min-h-screen text-gray-100 w-full">
            <div className="p-4 space-y-6 flex flex-col justify-center items-center flex-grow">
                <h1 className="text-3xl font-bold">Budget Overview</h1>

                {/* Income Summary */}
                <section className="w-full gap-2 flex flex-row">
                    <div className={"flex flex-1/4"}></div>
                    <div className={"flex flex-col flex-1/3 bg-gray-800 p-4 rounded-xl"}>
                        <h2 className="text-xl font-semibold mb-2">Income Summary</h2>
                        <p className="text-green-400 font-medium">
                            Monthly income: {formatCurrency(averageIncomePerMonth)}
                        </p>
                    </div>
                    <div className={"flex flex-col flex-1/4 bg-gray-800 p-4 rounded-xl"}>
                        <div className={"grid grid-cols-4 text-sm gap-2"}>
                            {months.map(month => {
                                const isSelected = isMonthSelected(month);
                                if (isSelected) {
                                    return <span className={"px-1 border-2 cursor-pointer select-none bg-green-900"}
                                                 onClick={() => handleMonthSelect(month)} key={month}>{month}</span>
                                }
                                return <span className={"px-1 border-2 cursor-pointer select-none"}
                                             onClick={() => handleMonthSelect(month)} key={month}>{month}</span>
                            })}
                        </div>
                    </div>
                </section>

                {/* Budget Posts List */}
                <section className="w-full flex gap-2 flex-row">
                    <div className={"bg-gray-800 p-4 rounded-xl flex flex-col gap-1 divide-y flex-1/4"}>
                        <h2 className="text-xl font-semibold mb-2">Expense Categories</h2>
                        {sortedAveragesByCategory.map(e => {
                            const category = e.category;
                            return <div className={"flex flex-row justify-between items-center"} key={category}>
                                <div className={"flex flex-row flex-grow justify-between"}>
                                    <p>{category}</p>
                                    <p className={"pr-4"}>{formatCurrency(e.average)}</p>
                                </div>
                                <select
                                    value={getBudgetPostForCategory(category)?.title ?? ""}
                                    onChange={e => setCategoryBudgetMapping(category, budgetPosts.find(post => post.title === e.target.value)!)}
                                    className="bg-gray-800 max-w-26 text-white border border-gray-600 rounded py-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
                                    <option value={""}>Unassigned</option>
                                    {budgetPosts.map(post => (
                                        <option key={post.title} value={post.title}>
                                            {post.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        })}
                    </div>

                    <div className="flex-1/3 bg-gray-800 p-4 rounded-xl shadow-md">
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
                        <button className={"mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"}
                                onClick={() => confirm("This will overwrite all budget posts! Are you sure?") && handleUseExpenseAsBudget()}>
                            Use expense as budget post
                        </button>

                        <h2 className="text-xl font-semibold mb-2 mt-6">Budget Posts</h2>
                        {budgetPosts.length === 0 ? (
                            <p className="text-gray-400">No budget posts yet.</p>
                        ) : (
                            <ul className="divide-y divide-gray-700">
                                {budgetPosts.map((post, index) => (
                                    <li key={index} className="py-2">
                                        <div
                                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
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
                    <div className={"flex-1/4 bg-gray-800 p-4 rounded-xl shadow-md flex flex-col"}>
                        <BudgetSummary {...{budgetPosts, dateFilteredExpensesByBudgetPost}}/>
                    </div>

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

interface BudgetSummaryProps {
    budgetPosts: BudgetPost[]
    dateFilteredExpensesByBudgetPost: Record<BudgetPost["title"], { amount: number, category: Category }[]>
}

const BudgetSummary = ({budgetPosts, dateFilteredExpensesByBudgetPost}: BudgetSummaryProps) => {
    return <>
        <h2 className="text-xl font-semibold mb-2">Budget Posts</h2>
        <div>Controls</div>
        <div className={"flex flex-col flex-grow divide-y divide-gray-400 gap-4"}>
            {budgetPosts.map(post => {
                const expenses = dateFilteredExpensesByBudgetPost[post.title]
                const sum = post.amount + expenses.reduce((pre, cur) => pre + cur.amount, 0)
                const isSumNegative = sum < 0;
                return <div key={post.title} className={"flex flex-col"}>
                    <div className={"font-bold flex flex-row justify-between"}>
                        <p>{post.title}</p>
                        <p className={"text-green-700"}>{formatCurrency(post.amount)}</p>
                    </div>
                    <div className={"flex flex-row text-gray-500"}>
                        {expenses.map(e => {
                            return <div className={"flex flex-row justify-between flex-grow"} key={e.category}>
                                <p>{e.category}</p>
                                <p>{formatCurrency(e.amount)}</p>
                            </div>
                        })}
                    </div>
                    <div className={"flex flex-row justify-between text-gray-500"}>
                        <p>Sum</p>
                        {isSumNegative && <p className={"text-amber-500"}>{formatCurrency(sum)}</p>}
                        {!isSumNegative && <p className={"text-green-500"}>{formatCurrency(sum)}</p>}
                    </div>
                </div>
            })}
        </div>
    </>
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
