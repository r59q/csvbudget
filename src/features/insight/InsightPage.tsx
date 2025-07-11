import {useTransactionsContext} from "@/context/TransactionsContext";
import useCategories from "@/hooks/Categories";
import useAverages from "@/hooks/Averages";
import {Category, Envelope, Transaction, TransactionID} from "@/model";
import {groupByEnvelope} from "@/utility/datautils";
import React, {createContext, useState} from "react";
import InsightPageView from "@/features/insight/InsightPageView";

interface InsightsContextType {
    getCategory: (transactionId: TransactionID) => Category;
    transactionsByEnvelope: Partial<Record<Envelope, Transaction[]>>;
    categoriesSortedByMonthlyCost: Category[];
    averages: ReturnType<typeof useAverages>;
    envelopes: Envelope[];
    selectedCategories: Category[];
    setSelectedCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

export const InsightsContext = createContext<InsightsContextType>(null!)

const InsightPage = () => {
    const {envelopeSelectedTransactions, envelopes} = useTransactionsContext();
    const {getCategory} = useCategories();
    const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
    const averages = useAverages(envelopeSelectedTransactions);

    const transactionsByEnvelope: Partial<Record<Envelope, Transaction[]>> = groupByEnvelope(envelopeSelectedTransactions);

    // For sorting categories by average expense
    const categoriesSortedByMonthlyCost = [...averages.categories].filter(e => e !== "Unassigned" || (e === "Unassigned" && averages.averageExpenseByCategoryPerEnvelope[e] !== 0))
        .toSorted((a, b) => (averages.averageExpenseByCategoryPerEnvelope[a] ?? 0) - (averages.averageExpenseByCategoryPerEnvelope[b] ?? 0));

    if (envelopeSelectedTransactions.length === 0) {
        return <>NO ENVELOPES SELECTED!!</> // Todo: Show a proper message
    }

    return (
        <InsightsContext.Provider
            value={{
                getCategory,
                transactionsByEnvelope,
                categoriesSortedByMonthlyCost,
                averages,
                envelopes,
                selectedCategories,
                setSelectedCategories
            }}>
            <InsightPageView/>
        </InsightsContext.Provider>
    );
};

export default InsightPage;
