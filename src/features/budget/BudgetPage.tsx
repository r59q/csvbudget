import React from 'react';
import BudgetOverview from "@/features/budget/BudgetOverview";
import ExpenseCategories from "@/features/budget/ExpenseCategories";
import BudgetPostsSection from "@/features/budget/BudgetPostsSection";
import {useBudgetPage} from "@/features/budget/useBudgetPage";
import BudgetSummary from "@/features/budget/BudgetSummary";
import BudgetEnvelopeSelector from "@/features/budget/BudgetEnvelopeSelector";

const BudgetPage = () => {
    // Not an actual context, but a hook.
    const ctx = useBudgetPage();

    return (
        <div className="min-h-screen text-gray-100 w-full bg-gradient-to-b from-gray-950 to-[#0a0a0a]">
            <div className="p-4 space-y-6 flex flex-col justify-center items-center flex-grow">

                {/* Income Summary */}
                <section className="w-full gap-2 flex flex-row">
                    <div className={"flex flex-1/4"}></div>
                    <div className={"flex flex-col justify-evenly flex-1/3 bg-gray-800 p-4 rounded-xl"}>
                        <h1 className="text-3xl font-bold text-center">Budgeting</h1>
                        <div>
                            <p>Set and track how well you follow your budget.</p>
                            <p>Create budget posts and map expense categories to budget posts.</p>
                        </div>
                    </div>

                    {/* Budget Envelope selection */}
                    <BudgetEnvelopeSelector
                        envelopes={ctx.envelopes}
                        isEnvelopedBudgetSelected={ctx.isEnvelopedBudgetSelected}
                        handleEnvelopeSelect={ctx.handleMonthSelect}
                    />
                </section>

                <section className="w-full flex gap-2 flex-row">
                    <ExpenseCategories
                        averageExpenseByCategoryPerEnvelope={ctx.averageExpenseByCategoryPerEnvelope}
                        getBudgetPostForCategory={ctx.getBudgetPostForCategory}
                        setCategoryBudgetMapping={ctx.setCategoryBudgetMapping}
                        budgetPosts={ctx.budgetPosts}
                    />
                    <BudgetPostsSection
                        budgetPosts={ctx.budgetPosts}
                        newTitle={ctx.newTitle}
                        setNewTitle={ctx.setNewTitle}
                        newAmount={ctx.newAmount}
                        setNewAmount={ctx.setNewAmount}
                        handleCreatePost={ctx.handleCreatePost}
                        handleRenameTitle={ctx.handleRenameTitle}
                        handleUpdateAmount={ctx.handleUpdateAmount}
                        deleteBudgetPost={ctx.deleteBudgetPost}
                        handleUseExpenseAsBudget={ctx.handleUseExpenseAsBudget}
                    />
                    <div className={"flex-1/4 bg-gray-800 p-4 rounded-xl shadow-md flex flex-col"}>
                        <BudgetOverview
                            budgetPosts={ctx.budgetPosts}
                            budgetEnvelopes={ctx.budgetEnvelopes}
                            budgetSelectedTransactions={ctx.budgetSelectedTransactions}
                            groupByPost={ctx.groupByPost}
                            budgetNet={ctx.budgetNet}
                            getTransactionPost={(t => ctx.getBudgetPostForCategory(t.category))}
                        />
                    </div>
                </section>

                {/* Summary */}
                <section className="w-full flex gap-2 flex-row">
                    <div className={"flex-1/4"}></div>
                    <BudgetSummary budgetNet={ctx.budgetNet} averageIncome={ctx.selectedEnvelopeAverageIncome} averages={ctx.averages} budgetPosts={ctx.budgetPosts}/>
                    <div className={"flex-1/4"}></div>
                </section>
            </div>
        </div>
    );
};

export default BudgetPage;
