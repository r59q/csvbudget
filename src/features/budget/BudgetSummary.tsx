import React from "react";
import {BudgetPost} from "@/model";
import useFormatCurrency from "@/hooks/FormatCurrency";

interface BudgetSummaryProps {
    budgetNet: { title: string, net: number }[];
    averages: {
        averageIncomePerEnvelope: number;
        averageExpensePerEnvelope: number;
        averageNetPerEnvelope: number;
    };
    budgetPosts: BudgetPost[];
    averageIncome: number;
}

const BudgetSummary = ({budgetNet, averages, budgetPosts, averageIncome}: BudgetSummaryProps) => {
    const totalBudget = budgetPosts.reduce((sum, post) => sum + post.amount, 0);
    const headroom = averageIncome - totalBudget;
    const formatCurrency = useFormatCurrency();

    return (
        <div className={"bg-gray-800 p-4 rounded-xl flex-1/3"}>
            <h2 className="text-xl font-semibold mb-2">Summary</h2>
            <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between items-center text-gray-400">
                    <span>Monthly Income:</span>
                    <span className="font-semibold">{formatCurrency(averages.averageIncomePerEnvelope)}</span>
                </div>
                <div className="flex flex-row justify-between items-center text-gray-400">
                    <span>Monthly Budget:</span>
                    <span
                        className="font-semibold">{formatCurrency(budgetPosts.reduce((sum, post) => sum + post.amount, 0))}</span>
                </div>
                <div className="flex flex-row justify-between items-center text-gray-400">
                    <span>Headroom</span>
                    <span
                        className={`font-semibold ${headroom < 0 ? "text-red-400" : "text-green-400"}`}>{formatCurrency(headroom)}</span>
                </div>
            </div>
        </div>
    );
};

export default BudgetSummary;

