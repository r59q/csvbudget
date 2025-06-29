import {useMemo} from "react";
import {Envelope, Category, Transaction, TransactionID} from '@/model';
import useCategories from "@/hooks/Categories";
import { useTransactionsContext } from "@/context/TransactionsContext";
import {groupByEnvelope} from "@/utility/datautils";

export interface EnvelopeCalculations {
    income: number;
    expenses: number;
    net: number;
    expensesByCategory: Record<Category, number>;
}

export default function useEnvelopeCalculations(): Record<Envelope, EnvelopeCalculations> {
    const { envelopes, envelopeSelectedTransactions } = useTransactionsContext();
    const { getCategory } = useCategories();

    const transactionsByEnvelope: Record<Envelope, Transaction[]> = groupByEnvelope(envelopeSelectedTransactions)

    return useMemo(() => {
        const calculations: Record<Envelope, EnvelopeCalculations> = {};
        envelopes.forEach(envelope => {
            const transactions = transactionsByEnvelope[envelope] || [];
            const income = transactions.filter(tran => tran.type === "income").reduce((sum, tran) => sum + tran.amount, 0);
            const expenseTransactions = transactions.filter(tran => tran.type === "expense");
            const expenses = expenseTransactions.reduce((sum, tran) => sum + tran.amount, 0);
            const net = income + expenses;
            const expensesByCategory: Record<Category, number> = {};
            expenseTransactions.forEach(tran => {
                const category = getCategory(tran.id);
                if (!expensesByCategory[category]) {
                    expensesByCategory[category] = 0;
                }
                expensesByCategory[category] += tran.amount;
            });
            calculations[envelope] = {
                income,
                expenses,
                net,
                expensesByCategory
            };
        });
        return calculations;
    }, [envelopes, transactionsByEnvelope, getCategory]);
}
