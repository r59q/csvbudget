import React, {useCallback} from 'react';
import {BudgetPost, Envelope, Transaction} from "@/model";
import useCategories from "@/hooks/Categories";
import useBudget from "@/hooks/Budget";
import {useTransactionsContext} from "@/context/TransactionsContext";
import useAverages from "@/hooks/Averages";
import {getExpenses, getSumAfterRefund} from "@/utility/datautils";

export const useBudgetPage = () => {
    const {envelopes, selectedEnvelopes, envelopeSelectedTransactions, transactions} = useTransactionsContext();
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
    const [newTitle, setNewTitle] = React.useState("");
    const [newAmount, setNewAmount] = React.useState(0);
    const [budgetEnvelopeFrom, setBudgetEnvelopeFrom] = React.useState<number | undefined>(undefined);
    const [budgetEnvelopeTo, setBudgetEnvelopeTo] = React.useState<number | undefined>(undefined);

    const isEnvelopedBudgetSelected = React.useCallback((envelope: Envelope) => {
        const idx = envelopes.indexOf(envelope);
        if (budgetEnvelopeFrom === undefined || budgetEnvelopeTo === undefined) {
            return false;
        }
        const start = Math.min(budgetEnvelopeFrom, budgetEnvelopeTo);
        const end = Math.max(budgetEnvelopeFrom, budgetEnvelopeTo);
        return idx >= start && idx <= end;
    }, [envelopes, budgetEnvelopeFrom, budgetEnvelopeTo]);

    const budgetEnvelopes = React.useMemo(() => {
        return envelopes.filter(envelope => isEnvelopedBudgetSelected(envelope));
    }, [envelopes, isEnvelopedBudgetSelected]);

    const budgetSelectedTransactions = React.useMemo(() => {
        return transactions.filter(tran => budgetEnvelopes.includes(tran.envelope));
    }, [transactions, budgetEnvelopes]);

    const budgetSelectedExpenses = React.useMemo(() => {
        return budgetSelectedTransactions.filter(tran => tran.type === "expense");
    }, [budgetSelectedTransactions]);

    const averages = useAverages(envelopeSelectedTransactions, {envelopesFilter: selectedEnvelopes});
    const budgetAverages = useAverages(budgetSelectedTransactions, {envelopesFilter: selectedEnvelopes});

    const groupByPost = useCallback((transactions: Transaction[]) => {
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
    }, [getBudgetPostForCategory, getCategory]);

    const handleMonthSelect = (envelope: Envelope) => {
        const idx = envelopes.indexOf(envelope);
        if (idx === -1) return;

        // If no selection, start new selection
        if (budgetEnvelopeFrom === undefined || budgetEnvelopeTo === undefined) {
            setBudgetEnvelopeFrom(idx);
            setBudgetEnvelopeTo(idx);
            return;
        }

        // If clicking the same single envelope that's already selected, deselect it
        if (budgetEnvelopeFrom === budgetEnvelopeTo && idx === budgetEnvelopeFrom) {
            setBudgetEnvelopeFrom(undefined);
            setBudgetEnvelopeTo(undefined);
            return;
        }

        // If both are set and different, extend the range to include the clicked envelope
        if (budgetEnvelopeFrom !== undefined && budgetEnvelopeTo !== undefined) {
            const currentStart = Math.min(budgetEnvelopeFrom, budgetEnvelopeTo);
            const currentEnd = Math.max(budgetEnvelopeFrom, budgetEnvelopeTo);

            // If clicking within or at the boundary of current range, reset to single selection
            if (idx >= currentStart && idx <= currentEnd) {
                setBudgetEnvelopeFrom(idx);
                setBudgetEnvelopeTo(idx);
                return;
            }

            // Extend the range to include the new envelope
            const newStart = Math.min(currentStart, idx);
            const newEnd = Math.max(currentEnd, idx);
            setBudgetEnvelopeFrom(newStart);
            setBudgetEnvelopeTo(newEnd);
            return;
        }
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
        const newCategoryBudgetMap: Record<string, string> = {};
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

    const averageExpenseByCategoryPerEnvelope = Object.fromEntries(
        Object.entries(averages.averageExpenseByCategoryPerEnvelope)
            .filter(([_, value]) => value < 0)
    );

    // Compute the net value for each budget post: (budgeted amount * number of selected envelopes) minus total expenses for that post in selected envelopes
    const budgetNet = React.useMemo(() => {
        const numEnvelopes = budgetEnvelopes.length;
        const grouped = groupByPost(budgetSelectedTransactions);
        return budgetPosts.map(post => {
            const transactions = grouped[post.title] || [];
            // Only sum negative amounts (expenses)
            const totalExpenses = getSumAfterRefund(getExpenses(transactions));
            return {
                title: post.title,
                net: post.amount * numEnvelopes + totalExpenses
            };
        });
    }, [budgetPosts, budgetSelectedTransactions, groupByPost, budgetEnvelopes]);

    const selectedEnvelopeIncomeTotal = React.useMemo(() => {
        return selectedEnvelopes.reduce((total, envelope) => {
            const transactions = envelopeSelectedTransactions.filter(tran => tran.envelope === envelope);
            const income = transactions.filter(tran => tran.type === "income");
            return total + getSumAfterRefund(income);
        }, 0);
    }, [selectedEnvelopes, envelopeSelectedTransactions]);

    const selectedEnvelopeExpensesTotal = React.useMemo(() => {
        return selectedEnvelopes.reduce((total, envelope) => {
            const transactions = envelopeSelectedTransactions.filter(tran => tran.envelope === envelope);
            const expenses = transactions.filter(tran => tran.type === "expense");
            return total + getSumAfterRefund(expenses);
        }, 0);
    }, [selectedEnvelopes, envelopeSelectedTransactions]);

    const selectedEnvelopeAverageIncome = React.useMemo(() => {
        return selectedEnvelopeIncomeTotal / selectedEnvelopes.length;
    }, [selectedEnvelopeIncomeTotal, selectedEnvelopes.length]);

    return {
        envelopes,
        selectedEnvelopes,
        envelopeSelectedTransactions,
        budgetPosts,
        createBudgetPost,
        deleteBudgetPost,
        saveBudgetPosts,
        getBudgetPostForCategory,
        setCategoryBudgetMapping,
        setBudgetPosts,
        setCategoryBudgetMap,
        groupByCategory,
        getCategory,
        categories,
        newTitle,
        setNewTitle,
        newAmount,
        setNewAmount,
        budgetEnvelopeFrom,
        setBudgetEnvelopeFrom,
        budgetEnvelopeTo,
        setBudgetEnvelopeTo,
        isEnvelopedBudgetSelected,
        budgetEnvelopes,
        budgetSelectedTransactions,
        averages,
        budgetAverages,
        groupByPost,
        handleMonthSelect,
        handleCreatePost,
        handleRenameTitle,
        handleUpdateAmount,
        handleUseExpenseAsBudget,
        averageExpenseByCategoryPerEnvelope,
        selectedEnvelopeIncomeTotal,
        budgetNet,
        selectedEnvelopeExpensesTotal,
        selectedEnvelopeAverageIncome
    };
};
