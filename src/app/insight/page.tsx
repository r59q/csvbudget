"use client";
import React from 'react';
import {TransactionsProvider} from "@/context/TransactionsContext";
import InsightPage from "@/features/insight/InsightPage";


const Page = () => {
    return (
        <TransactionsProvider>
            <InsightPage/>
        </TransactionsProvider>
    );
};

export default Page;

