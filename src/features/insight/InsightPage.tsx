import {useTransactionsContext} from "@/context/TransactionsContext";
import useCategories from "@/hooks/Categories";
import useAverages from "@/hooks/Averages";
import {Category, Envelope, Transaction, TransactionID} from "@/model";
import {groupByEnvelope} from "@/utility/datautils";
import React, {createContext, useState} from "react";
import InsightPageView from "@/features/insight/InsightPageView";
import {MdOutlineMailOutline} from "react-icons/md";

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
    const averages = useAverages(envelopeSelectedTransactions);

    const transactionsByEnvelope: Partial<Record<Envelope, Transaction[]>> = groupByEnvelope(envelopeSelectedTransactions);

    // For sorting categories by average expense
    const categoriesSortedByMonthlyCost = [...averages.categories].filter(e => e !== "Unassigned" || (e === "Unassigned" && averages.averageExpenseByCategoryPerEnvelope[e] !== 0))
        .toSorted((a, b) => (averages.averageExpenseByCategoryPerEnvelope[a] ?? 0) - (averages.averageExpenseByCategoryPerEnvelope[b] ?? 0))

    if (envelopeSelectedTransactions.length === 0) {
        return (
            <div
                className="flex flex-col items-center justify-center h-screen text-gray-500 bg-gradient-to-b from-gray-950 to-[#0a0a0a]">
                <span className="text-6xl mb-4">
                    <MdOutlineMailOutline/>
                </span>
                <span className="text-xl font-semibold mb-2">No envelopes selected</span>
                <span className="text-base text-gray-400">Please select at least one envelope in the filter tab to view insights.</span>
            </div>
        );
    }

    return (
        <ContextProvider {...{transactionsByEnvelope, getCategory, envelopes, categoriesSortedByMonthlyCost, averages}}>
            <InsightPageView/>
        </ContextProvider>
    );
};

const ContextProvider = ({
                             children,
                             categoriesSortedByMonthlyCost,
                             getCategory,
                             transactionsByEnvelope,
                             envelopes,
                             averages
                         }: React.PropsWithChildren<Omit<InsightsContextType, "setSelectedCategories" | "selectedCategories">>) => {
    const [selectedCategories, setSelectedCategories] = useState<Category[]>(categoriesSortedByMonthlyCost);

    return <InsightsContext.Provider
        value={{
            getCategory,
            transactionsByEnvelope,
            categoriesSortedByMonthlyCost,
            averages,
            envelopes,
            selectedCategories,
            setSelectedCategories
        }}>
        {children}
    </InsightsContext.Provider>
}

export default InsightPage;
