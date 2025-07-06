import {Transaction} from "@/model";

const useAverages = (transactions: Transaction[]) => {
    // Get unique envelopes and categories
    const envelopes = Array.from(new Set(transactions.map(t => t.envelope)));
    const categories = Array.from(new Set(transactions.map(t => t.category)));

    // Filter by type
    const incomeTransactions = transactions.filter(t => t.type === "income");
    const expenseTransactions = transactions.filter(t => t.type === "expense");

    // Totals
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const net = totalIncome + totalExpense;

    // Averages
    const envelopeCount = envelopes.length || 1;
    const averageIncome = totalIncome / envelopeCount;
    const averageExpense = totalExpense / envelopeCount;
    const averageNet = net / envelopeCount;

    // Average by category (expenses only)
    const averageByCategory: Record<string, number> = {};
    categories.forEach(category => {
        const catTotal = expenseTransactions.filter(t => t.category === category).reduce((sum, t) => sum + t.amount, 0);
        averageByCategory[category] = catTotal / envelopeCount;
    });

    // Average by type
    const types = ["income", "expense", "transfer", "refund", "unknown"] as const;
    const averageByType: Record<string, number> = {};
    types.forEach(type => {
        const typeTotal = transactions.filter(t => t.type === type).reduce((sum, t) => sum + t.amount, 0);
        averageByType[type] = typeTotal / envelopeCount;
    });

    // Per-envelope stats
    const envelopeStats: Record<string, {
        income: number;
        expenses: number;
        net: number;
        expensesByCategory: Record<string, number>;
    }> = {};
    envelopes.forEach(envelope => {
        const envelopeTransactions = transactions.filter(t => t.envelope === envelope);
        const income = envelopeTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
        const expenseTransactions = envelopeTransactions.filter(t => t.type === "expense");
        const expenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
        const net = income + expenses;
        const expensesByCategory: Record<string, number> = {};
        expenseTransactions.forEach(t => {
            const category = t.category;
            if (!expensesByCategory[category]) expensesByCategory[category] = 0;
            expensesByCategory[category] += t.amount;
        });
        envelopeStats[envelope] = { income, expenses, net, expensesByCategory };
    });

    return {
        envelopes,
        categories,
        totalIncomeAcrossAllEnvelopes: totalIncome,
        totalExpenseAcrossAllEnvelopes: totalExpense,
        netIncomeAndExpenseAcrossAllEnvelopes: net,
        averageIncomePerEnvelope: averageIncome,
        averageExpensePerEnvelope: averageExpense,
        averageNetPerEnvelope: averageNet,
        averageExpenseByCategoryPerEnvelope: averageByCategory,
        averageAmountByTransactionTypePerEnvelope: averageByType,
        envelopeStats,
    };
};

export default useAverages;