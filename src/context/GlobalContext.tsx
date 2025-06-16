import React, {createContext, useContext, useEffect} from "react";
import {CSVFile} from "@/model";
import {getCSVFilesData} from "@/data";
import useCSVFiles from "@/hooks/useCSVFiles";

export interface GlobalContextType {
    user: { name: string; email: string } | null;
    setUser: (user: { name: string; email: string } | null) => void;
    csvFiles: CSVFile[];
    setCSVFiles: (files: CSVFile[]) => void;
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

    // Load existing CSVs from localStorage on mount
    useEffect(() => {
        const stored = getCSVFilesData().load();
        setCSVFiles(stored);
    }, []);

    return (
        <GlobalContext.Provider value={{user, setUser, csvFiles, setCSVFiles}}>
            {children}
        </GlobalContext.Provider>
    );
};
