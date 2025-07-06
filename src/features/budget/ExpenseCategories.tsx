import {BudgetPost} from "@/model";
import {formatCurrency} from "@/utility/datautils";
import React from "react";

interface Props {
    averageExpenseByCategoryPerEnvelope: Record<string, number>;
    getBudgetPostForCategory: (category: string) => BudgetPost | undefined;
    setCategoryBudgetMapping: (category: string, post: BudgetPost) => void;
    budgetPosts: BudgetPost[];
}

const ExpenseCategories = ({
                               averageExpenseByCategoryPerEnvelope,
                               getBudgetPostForCategory,
                               setCategoryBudgetMapping,
                               budgetPosts
                           }: Props) => {
    return (
        <div className={"bg-gray-800 p-4 rounded-xl flex flex-col gap-1 divide-y flex-1/4"}>
            <h2 className="text-xl font-semibold mb-2">Expense Categories</h2>
            {Object.entries(averageExpenseByCategoryPerEnvelope)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([category, average]) => {
                    return (
                        <div
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
                    );
                })}
        </div>
    );
}

export default ExpenseCategories;
