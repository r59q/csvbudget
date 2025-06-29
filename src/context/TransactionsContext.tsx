import React, {createContext, useContext} from "react";
import useTransactions from "@/hooks/Transactions";

// Infer the type from the hook's return value
export type TransactionsContextType = ReturnType<typeof useTransactions>;

export const TransactionsContext = createContext<TransactionsContextType>(undefined!);

export const TransactionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const value = useTransactions();
    return (
        <TransactionsContext.Provider value={value}>
            {children}
        </TransactionsContext.Provider>
    );
};

export const useTransactionsContext = () => {
    const ctx = useContext(TransactionsContext);
    if (!ctx) throw new Error("useTransactionsContext must be used within a TransactionsProvider");
    return ctx;
};
