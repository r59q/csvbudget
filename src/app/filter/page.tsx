"use client";
import React from 'react';

import {TransactionsProvider} from "@/context/TransactionsContext";
import FilterPage from "@/features/FilterPage";

const Page = () => {
    return (
        <TransactionsProvider>
            <FilterPage/>
        </TransactionsProvider>
    );
};

export default Page;
