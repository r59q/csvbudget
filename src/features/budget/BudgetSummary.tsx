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
}

const BudgetSummary = ({budgetNet, averages, budgetPosts}: BudgetSummaryProps) => {
    const headroom = budgetPosts.reduce((sum, post) => sum + post.amount, 0) + averages.averageExpensePerEnvelope;
    const totalNet = budgetNet.reduce((sum, item) => sum + item.net, 0);
    const formatCurrency = useFormatCurrency();
    return (
        <div className={"bg-gray-800 p-4 rounded-xl flex-1/3"}>
            <h2 className="text-xl font-semibold mb-2">Summary</h2>
            <div className="flex flex-col gap-1 mb-4">
                <div className="flex flex-row justify-between items-center text-gray-400 mb-2">
                    <span>Average Income:</span>
                    <span className="font-semibold">{formatCurrency(averages.averageIncomePerEnvelope)}</span>
                </div>
                <div className="flex flex-row justify-between items-center text-gray-400 mb-2">
                    <span>Average Expense:</span>
                    <span className="font-semibold">{formatCurrency(averages.averageExpensePerEnvelope)}</span>
                </div>
                <div className="flex flex-row justify-between items-center text-gray-400 mb-4">
                    <span>Avg Income - Avg Expense:</span>
                    <span
                        className={`font-semibold ${averages.averageNetPerEnvelope < 0 ? "text-red-400" : "text-green-400"}`}>
                        {formatCurrency(averages.averageNetPerEnvelope)}
                    </span>
                </div>

                <div className="flex flex-row justify-between items-center text-gray-400 mb-2">
                    <span>Total Budget:</span>
                    <span
                        className="font-semibold">{formatCurrency(budgetPosts.reduce((sum, post) => sum + post.amount, 0))}</span>
                </div>
                <div className="flex flex-row justify-between items-center text-gray-400 mb-2">
                    <span>Headroom</span>
                    <span
                        className={`font-semibold ${headroom < 0 ? "text-red-400" : "text-green-400"}`}>{formatCurrency(headroom)}</span>
                </div>
                <div className="flex flex-row justify-between items-center text-gray-400 mb-2">
                    <span>Budget - Expenses:</span>
                    <span
                        className={`font-semibold ${totalNet < 0 ? "text-red-400" : "text-green-400"}`}>
                        {formatCurrency(totalNet)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BudgetSummary;

