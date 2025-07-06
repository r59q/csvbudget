import React, {useMemo, useState} from 'react';
import {BudgetPost, CategoryBudgetPostMap, Envelope, Transaction} from "@/model";
import {formatCurrency} from "@/utility/datautils";
import useCategories from "@/hooks/Categories";
import useBudget from "@/hooks/Budget";
import {useTransactionsContext} from "@/context/TransactionsContext";
import useAverages from "@/hooks/Averages";
import BudgetOverview from "@/features/budget/BudgetOverview";
import ExpenseCategories from "@/features/budget/ExpenseCategories";

const BudgetPage = () => {
    const {envelopes, selectedEnvelopes, envelopeSelectedTransactions} = useTransactionsContext();
    const {
        budgetPosts,
        createBudgetPost,
        deleteBudgetPost,
        saveBudgetPosts,
        getBudgetPostForCategory,
        setCategoryBudgetMapping,
        setBudgetPosts,
        setCategoryBudgetMap
    } = useBudget();
    const {groupByCategory, getCategory, categories} = useCategories();
    const [newTitle, setNewTitle] = useState("");
    const [newAmount, setNewAmount] = useState(0);
    const [budgetEnvelopeFrom, setBudgetEnvelopeFrom] = useState<number | undefined>(undefined);
    const [budgetEnvelopeTo, setBudgetEnvelopeTo] = useState<number | undefined>(undefined);

    const isEnvelopedBudgetSelected = React.useCallback((month: Envelope) => {
        const idx = envelopes.indexOf(month);
        if (budgetEnvelopeFrom === undefined) {
            return true;
        }
        if (budgetEnvelopeTo === undefined) {
            return idx >= budgetEnvelopeFrom;
        }
        return idx >= budgetEnvelopeFrom && idx <= budgetEnvelopeTo;
    }, [envelopes, budgetEnvelopeFrom, budgetEnvelopeTo]);

    const budgetEnvelopes = useMemo(() => {
        return envelopes.filter(envelope => isEnvelopedBudgetSelected(envelope));
    }, [envelopes, isEnvelopedBudgetSelected]);

    const budgetSelectedTransactions = useMemo(() => {
        return envelopeSelectedTransactions.filter(tran => budgetEnvelopes.includes(tran.envelope));
    }, [envelopeSelectedTransactions, budgetEnvelopes]);

    const averages = useAverages(envelopeSelectedTransactions, {envelopesFilter: selectedEnvelopes});
    const budgetAverages = useAverages(budgetSelectedTransactions, {envelopesFilter: selectedEnvelopes});


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
        setBudgetEnvelopeTo(undefined);
        setBudgetEnvelopeFrom(idx);
    };

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
        const newPosts: BudgetPost[] = [];
        const newCategoryBudgetMap: CategoryBudgetPostMap = {};
        Object.entries(averages.averageExpenseByCategoryPerEnvelope)
            .filter(([, average]) => average < 0)
            .forEach(([category, average]) => {
                const post = {amount: Math.round(-average), title: category};
                newPosts.push(post);
                newCategoryBudgetMap[category] = category;
            });
        setBudgetPosts(newPosts);
        setCategoryBudgetMap(newCategoryBudgetMap);
    };

    // Filter out empty categories
    const averageExpenseByCategoryPerEnvelope = Object.fromEntries(
        Object.entries(averages.averageExpenseByCategoryPerEnvelope)
            .filter(([_, value]) => value < 0)
    );

    return (
        <div className="min-h-screen text-gray-100 w-full">
            <div className="p-4 space-y-6 flex flex-col justify-center items-center flex-grow">
                <h1 className="text-3xl font-bold">Budget Overview</h1>

                {/* Income Summary */}
                <section className="w-full gap-2 flex flex-row">
                    <div className={"flex flex-1/4"}></div>
                    <div className={"flex flex-col flex-1/3 bg-gray-800 p-4 rounded-xl"}>{/*
                        <h2 className="text-xl font-semibold mb-2">Income Summary</h2>
                        <p className="text-green-400 font-medium">
                            Monthly income: AVERAGE INCOME WAS HERE formatCurrency(averageIncomePerMonth)
                        </p>
                    */}</div>
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

                <section className="w-full flex gap-2 flex-row">
                    <ExpenseCategories
                        averageExpenseByCategoryPerEnvelope={averageExpenseByCategoryPerEnvelope}
                        getBudgetPostForCategory={getBudgetPostForCategory}
                        setCategoryBudgetMapping={setCategoryBudgetMapping}
                        budgetPosts={budgetPosts}
                    />

                    {/* Budget Posts */}
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
                        <BudgetOverview
                            budgetPosts={budgetPosts}
                            budgetEnvelopes={budgetEnvelopes}
                            transactions={budgetSelectedTransactions}
                            groupByPost={groupByPost}
                        />
                    </div>

                </section>

                {/* Summary */}
                <section className="w-full flex gap-2 flex-row">
                    <div className={"bg-gray-800 p-4 rounded-xl flex-1/4"}></div>
                    <div className={"bg-gray-800 p-4 rounded-xl flex-1/3"}>
                        <h2 className="text-xl font-semibold mb-2">Summary</h2>
                        <div className="flex flex-col gap-1 mb-4">
                            <div className="flex flex-row justify-between items-center text-gray-400 mb-2">
                                <span>Average Income:</span>
                                <span
                                    className="font-semibold">{formatCurrency(averages.averageIncomePerEnvelope)}</span>
                            </div>
                            <div className="flex flex-row justify-between items-center text-gray-400 mb-2">
                                <span>Total Budget:</span>
                                <span
                                    className="font-semibold">{formatCurrency(budgetPosts.reduce((sum, post) => sum + post.amount, 0))}</span>
                            </div>
                            <div className="flex flex-row justify-between items-center text-gray-400 mb-4">
                                <span>Difference:</span>
                                <span
                                    className={`font-semibold ${averages.averageNetPerEnvelope < 0 ? "text-red-400" : "text-green-400"}`}>
                                    {formatCurrency(averages.averageNetPerEnvelope)}
                                </span>
                            </div>
                            <div className="flex flex-row justify-between items-center text-gray-400 mb-2">
                                <span>Average Expense:</span>
                                <span
                                    className="font-semibold">{formatCurrency(averages.averageExpensePerEnvelope)}</span>
                            </div>
                            {/* Average Income - Average Expense */}
                            <div className="flex flex-row justify-between items-center text-gray-400 mb-2">
                                <span>Avg Income - Avg Expense:</span>
                                <span className="font-semibold">{formatCurrency(averages.averageNetPerEnvelope)}</span>
                            </div>
                        </div>
                    </div>
                    <div className={"flex-1/4"}></div>
                </section>
            </div>
        </div>
    );
};


export default BudgetPage;



