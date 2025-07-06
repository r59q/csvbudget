import React from "react";
import { BudgetPost } from "@/model";

interface BudgetPostsSectionProps {
    budgetPosts: BudgetPost[];
    newTitle: string;
    setNewTitle: (title: string) => void;
    newAmount: number;
    setNewAmount: (amount: number) => void;
    handleCreatePost: () => void;
    handleRenameTitle: (index: number, newTitle: string) => void;
    handleUpdateAmount: (index: number, newAmount: number) => void;
    deleteBudgetPost: (post: BudgetPost) => void;
    handleUseExpenseAsBudget: () => void;
}

const BudgetPostsSection = ({
    budgetPosts,
    newTitle,
    setNewTitle,
    newAmount,
    setNewAmount,
    handleCreatePost,
    handleRenameTitle,
    handleUpdateAmount,
    deleteBudgetPost,
    handleUseExpenseAsBudget
}: BudgetPostsSectionProps) => {
    return (
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
    );
};

export default BudgetPostsSection;

