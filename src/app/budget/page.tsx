"use client";
import React, {useMemo, useState} from 'react';
import useBudget from "@/hooks/Budget";
import {formatCurrency, getSum, groupByEnvelope} from "@/utility/datautils";
import useCategories from "@/hooks/Categories";
import {BudgetPost, CategoryBudgetPostMap, Envelope, Transaction} from "@/model";
import {TransactionsProvider, useTransactionsContext} from "@/context/TransactionsContext";

const Page = () => {
    return (
        <TransactionsProvider>
            <BudgetPage/>
        </TransactionsProvider>
    );
};


function BudgetPage() {
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
    const {envelopes, envelopeSelectedTransactions} = useTransactionsContext()
    const {groupByCategory, getCategory, categories} = useCategories();
    const [newTitle, setNewTitle] = useState("");
    const [newAmount, setNewAmount] = useState(0);
    const [budgetEnvelopeFrom, setBudgetEnvelopeFrom] = useState<number | undefined>(undefined);
    const [budgetEnvelopeTo, setBudgetEnvelopeTo] = useState<number | undefined>(undefined);

    // All the transactions in the selected envelopes. These are the global selected transactions
    const expenseByEnvelope = groupByEnvelope(envelopeSelectedTransactions.filter(e => e.type === "expense"));
    const expenseByCategory = groupByCategory(envelopeSelectedTransactions.filter(e => e.type === "expense"));
    const incomeByEnvelope = groupByEnvelope(envelopeSelectedTransactions.filter(e => e.type === "income"));
    const averageIncomePerMonth = envelopes.length > 0 ? getSum(incomeByEnvelope[envelopes[0]] || []) / envelopes.length : 0;

    // Transactions in the selected budget envelopes these are the envelopes for the budget
    const getBudgetEnvelopes = () => {
        if (budgetEnvelopeFrom === undefined) {
            return envelopes;
        }
        if (budgetEnvelopeTo === undefined) {
            return envelopes.slice(budgetEnvelopeFrom);
        }
        return envelopes.slice(budgetEnvelopeFrom, budgetEnvelopeTo + 1);
    }
    const budgetSelectedEnvelopes = useMemo(() => {
        const selectedEnvelopes = getBudgetEnvelopes();
        return selectedEnvelopes.map(envelope => {
            return {
                envelope,
                transactions: envelopeSelectedTransactions.filter(tran => tran.envelope === envelope)
            };
        });
    }, [envelopeSelectedTransactions, budgetEnvelopeFrom, budgetEnvelopeTo, envelopes]);

    const isEnvelopedBudgetSelected = (month: Envelope) => {
        const idx = envelopes.indexOf(month);
        if (budgetEnvelopeFrom === undefined) {
            return true;
        }
        if (budgetEnvelopeTo === undefined) {
            return idx >= budgetEnvelopeFrom;
        }
        return idx >= budgetEnvelopeFrom && idx <= budgetEnvelopeTo;
    }

    const budgetEnvelopes = useMemo(() => {
        return envelopes.filter(envelope => isEnvelopedBudgetSelected(envelope));
    }, [envelopes, budgetEnvelopeFrom, budgetEnvelopeTo]);
    const budgetSelectedTransactions = useMemo(() => {
        return envelopeSelectedTransactions.filter(tran => budgetEnvelopes.includes(tran.envelope));
    }, [envelopeSelectedTransactions, budgetSelectedEnvelopes]);
    const expenseByBudgetEnvelope = useMemo(() => {
        return groupByEnvelope(budgetSelectedTransactions.filter(e => e.type === "expense"));
    }, [budgetSelectedTransactions]);


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
            const transactions = expenseByCategory[category] || [];
            const totalAmount = transactions.reduce((sum, tran) => sum + tran.amount, 0);
            const average = budgetSelectedEnvelopes.length > 0 ? totalAmount / budgetSelectedEnvelopes.length : 0;
            const post = {amount: Math.round(-average), title: category};
            newPosts.push(post);
            newCategoryBudgetMap[category] = category;
        })
        setBudgetPosts(newPosts);
        setCategoryBudgetMap(newCategoryBudgetMap);
    }

    const handleMonthSelect = (month: Envelope) => {
        const idx = envelopes.indexOf(month);
        if (idx === -1) return;
        if (budgetEnvelopeFrom === undefined) {
            setBudgetEnvelopeFrom(idx);
            return;
        }
        if (budgetEnvelopeTo === undefined) {
            setBudgetEnvelopeTo(idx);
            return;
        }
        setBudgetEnvelopeTo(undefined)
        setBudgetEnvelopeFrom(idx);
    }

    const groupByPost = (transactions: Transaction[]) => {
        const grouped: Partial<Record<BudgetPost['title'], Transaction[]>> = {};
        transactions.forEach(tran => {
            const post = getBudgetPostForCategory(getCategory(tran.id))?.title ?? "Unassigned";
            if (!post) return;
            if (!grouped[post]) {
                grouped[post] = [];
            }
            grouped[post]!.push(tran);
        });
        return grouped;
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
                            Monthly income: AVERAGE INCOME WAS HERE {/*formatCurrency(averageIncomePerMonth)*/}
                        </p>
                    </div>
                    <div className={"flex flex-col flex-1/4 bg-gray-800 p-4 rounded-xl"}>
                        <div className={"grid grid-cols-4 text-sm gap-2"}>
                            {envelopes.map(envelope => {
                                const isSelected = isEnvelopedBudgetSelected(envelope);
                                if (isSelected) {
                                    return <span className={"px-1 border-2 cursor-pointer select-none bg-green-900"}
                                                 onClick={() => handleMonthSelect(envelope)}
                                                 key={envelope}>{envelope}</span>
                                }
                                return <span className={"px-1 border-2 cursor-pointer select-none"}
                                             onClick={() => handleMonthSelect(envelope)}
                                             key={envelope}>{envelope}</span>
                            })}
                        </div>
                    </div>
                </section>

                {/* Budget Posts List */}
                <section className="w-full flex gap-2 flex-row">
                    <div className={"bg-gray-800 p-4 rounded-xl flex flex-col gap-1 divide-y flex-1/4"}>
                        <h2 className="text-xl font-semibold mb-2">Expense Categories</h2>
                        {Object.entries(expenseByCategory).sort(([a], [b]) => a.localeCompare(b)).map(([category, transactions]) => {
                            const total = (transactions ?? []).reduce((sum, tran) => sum + tran.amount, 0);
                            const average = envelopes.length > 0 ? total / envelopes.length : 0;
                            return <div
                                className={"flex flex-row justify-between items-center py-1.5 px-1 rounded hover:bg-gray-700 transition-colors duration-100"}
                                key={category}>
                                <div className={"flex flex-row flex-grow justify-between"}>
                                    <p>{category}</p>
                                    <p className={"pr-4"}>{formatCurrency(average)}</p>
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
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
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
                        <BudgetSummary {...{budgetPosts, budgetEnvelopes, expenseByBudgetEnvelope, groupByPost}}/>
                    </div>

                </section>

                {/* Summary */}
                <section className="w-full flex gap-2 flex-row">
                    <div className={"bg-gray-800 p-4 rounded-xl flex-1/4"}></div>
                    <div className={"bg-gray-800 p-4 rounded-xl flex-1/3"}>
                        <h2 className="text-xl font-semibold mb-2">Summary</h2>
                        <p>
                            Total Expenses: <span
                            className="font-semibold">{formatCurrency(Object.values(expenseByEnvelope).flat().reduce((sum, tran) => sum + tran.amount, 0))}</span>
                        </p>
                        <p>
                            Average Monthly Expenses: <span
                            className="font-semibold">{formatCurrency(envelopes.length > 0 ? Object.values(expenseByEnvelope).flat().reduce((sum, tran) => sum + tran.amount, 0) / envelopes.length : 0)}</span>
                        </p>
                        <p>
                            Remaining: <span
                            className={`font-semibold ${averageIncomePerMonth - (Object.values(expenseByEnvelope).flat().reduce((sum, tran) => sum + tran.amount, 0) / envelopes.length) < 0 ? "text-red-400" : "text-green-400"}`}>
                                {formatCurrency(averageIncomePerMonth - (Object.values(expenseByEnvelope).flat().reduce((sum, tran) => sum + tran.amount, 0) / envelopes.length))}
                            </span>
                        </p>
                    </div>
                    <div className={"flex-1/4"}></div>
                </section>
            </div>
        </div>
    );
}

interface BudgetSummaryProps {
    budgetPosts: BudgetPost[];
    expenseByBudgetEnvelope: Record<Envelope, Transaction[]>;
    budgetEnvelopes: Envelope[]
    groupByPost: (transactions: Transaction[]) => Partial<Record<BudgetPost['title'], Transaction[]>>;
}

const BudgetSummary = ({budgetPosts, expenseByBudgetEnvelope, budgetEnvelopes, groupByPost}: BudgetSummaryProps) => {
    const totalBudget = budgetPosts.reduce((sum, post) => sum + post.amount * budgetEnvelopes.length, 0);
    const totalExpenses = Object.values(expenseByBudgetEnvelope).flat().reduce((sum, tran) => sum + tran.amount, 0);
    const budgetPostGroups = useMemo(() => {
        return groupByPost(Object.values(expenseByBudgetEnvelope).flat());
    }, [expenseByBudgetEnvelope, groupByPost]);

    return <>
        <h2 className="text-xl font-semibold mb-2">Budget Summary</h2>
        <p className="text-gray-400 mb-2">Total Budget: <span
            className="text-green-400 font-mono">{formatCurrency(totalBudget)}</span></p>
        <p className="text-gray-400 mb-2">Total Expenses: <span
            className="text-red-400 font-mono">{formatCurrency(totalExpenses)}</span></p>
        {budgetPosts.length === 0 ? (
            <p className="text-gray-400">No budget posts yet.</p>
        ) : (
            <ul className="divide-y divide-gray-700">
                {budgetPosts.map((post, index) => {
                    const numberOfEnvelopes = budgetEnvelopes.length;
                    const budgetedAmount = post.amount * numberOfEnvelopes;
                    const postExpenses = budgetPostGroups[post.title] || [];
                    const totalPostExpenses = postExpenses.reduce((sum, tran) => sum + tran.amount, 0);
                    const isOverBudget = totalPostExpenses > budgetedAmount;
                    const formattedAmount = formatCurrency(budgetedAmount);
                    const formattedTotal = formatCurrency(totalPostExpenses);
                    const difference = budgetedAmount + totalPostExpenses;

                    return <li key={index} className="py-2 flex justify-between">
                        <div>
                            <p className="text-gray-200">{post.title}</p>
                        </div>
                        <div>
                            <p className={`font-mono ${isOverBudget ? "text-red-400" : "text-green-400"}`}>{formattedAmount}</p>
                            <p>{formattedTotal}</p>
                            <p className={`font-mono ${difference < 0 ? "text-red-400" : "text-green-400"}`}>
                                {formatCurrency(difference)}
                            </p>
                        </div>
                    </li>;
                })}
            </ul>
        )}
    </>
}

export default Page;
