"use client";
import React from 'react';
import {TransactionsProvider} from "@/context/TransactionsContext";
import BudgetPage from "@/features/budget/BudgetPage";

const Page = () => {
    return (
        <TransactionsProvider>
            <BudgetPage/>
        </TransactionsProvider>
    );
};

export default Page;
