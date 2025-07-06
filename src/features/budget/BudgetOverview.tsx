import React, {useMemo} from 'react';
import {BudgetPost, Envelope, Transaction} from "@/model";
import {formatCurrency} from "@/utility/datautils";

interface Props {
    budgetPosts: BudgetPost[];
    budgetEnvelopes: Envelope[];
    transactions: Transaction[];
    groupByPost: (transactions: Transaction[]) => Partial<Record<BudgetPost['title'], Transaction[]>>;
}
const BudgetOverview = ({
                           budgetPosts,
                           budgetEnvelopes,
                           transactions,
                           groupByPost
                       }: Props) => {
    const budgetPostGroups = useMemo(() => {
        return groupByPost(transactions);
    }, [transactions, groupByPost]);

    return (
        <>
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

                        return (
                            <li key={index} className="py-2 flex justify-between">
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
                            </li>
                        );
                    })}
                </ul>
            )}
        </>
    );
};

export default BudgetOverview;