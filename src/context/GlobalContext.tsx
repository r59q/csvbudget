import React, {createContext, useContext} from "react";
import {AccountNumber, CSVFile, UnmappedSchema} from "@/model";
import useCSVFiles from "@/hooks/useCSVFiles";
import useSchemaMapping from "@/hooks/SchemaMapping";
import {SchemaColumnMapping} from "@/utility/csvutils";
import useAccountMapping from "@/hooks/AccountMapping";
import useOwnedAccounts from "@/hooks/OwnedAccount";
import useCategories, {UseCategoriesResult} from "@/hooks/Categories";

export interface GlobalContextType extends UseCategoriesResult {
    user: { name: string; email: string } | null;
    setUser: (user: { name: string; email: string } | null) => void;
    csvFiles: CSVFile[];
    setCSVFiles: (files: CSVFile[]) => void;
    unmappedSchemas: UnmappedSchema[];
    handleSaveMapping: (mapping: any, schemaKey: string) => void;
    columnMappings: SchemaColumnMapping;
    accountValueMappings: Record<AccountNumber, string>,
    addAccountMapping: (original: string, mapped: string) => void;
    removeAccountMapping: (original: string) => void;
    isAccountOwned: (account: string | AccountNumber) => boolean;
    addOwnedAccount: (accountNumber: AccountNumber) => void;
    removeOwnedAccount: (accountNumber: AccountNumber) => void;
    getAccountMapping: (accountNumber: AccountNumber) => string | AccountNumber;
}

export const GlobalContext = createContext<GlobalContextType>(undefined!);

export function useGlobalContext() {
    const ctx = useContext(GlobalContext);
    if (!ctx) throw new Error("useGlobalContext must be used within a GlobalContextProvider");
    return ctx;
}

export const GlobalContextProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [user, setUser] = React.useState<{ name: string; email: string } | null>(null);
    const {csvFiles, setCSVFiles} = useCSVFiles();
    const {accountValueMappings, addAccountMapping, removeAccountMapping, getAccountMapping} = useAccountMapping();
    const {isAccountOwned, addOwnedAccount, removeOwnedAccount} = useOwnedAccounts();
    const categories = useCategories();
    const {
        unmappedSchemas,
        handleSaveMapping,
        columnMappings
    } = useSchemaMapping(csvFiles);

    return (
        <GlobalContext.Provider value={{
            user,
            setUser,
            csvFiles,
            setCSVFiles,
            isAccountOwned,
            unmappedSchemas,
            handleSaveMapping,
            columnMappings,
            accountValueMappings,
            addAccountMapping,
            removeAccountMapping,
            addOwnedAccount,
            removeOwnedAccount,
            getAccountMapping,
            ...categories
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

