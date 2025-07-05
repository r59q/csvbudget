'use client';

import React from 'react';
import {TransactionsProvider} from "@/context/TransactionsContext";
import ImportPage from "@/features/upload/ImportPage";

const Page = () => {
    return (
        <TransactionsProvider>
            <ImportPage/>
        </TransactionsProvider>
    );
};

export default Page;