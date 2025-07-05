'use client';

import React from 'react';
import {TransactionsProvider} from "@/context/TransactionsContext";
import ImportPage from "@/features/import/ImportPage";

const Page = () => {
    return (
        <TransactionsProvider>
            <ImportPage/>
        </TransactionsProvider>
    );
};

export default Page;