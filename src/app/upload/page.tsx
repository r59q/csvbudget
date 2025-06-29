'use client';

import React from 'react';
import {TransactionsProvider} from "@/context/TransactionsContext";
import UploadPage from "@/features/upload/UploadPage";

const Page = () => {
    return (
        <TransactionsProvider>
            <UploadPage/>
        </TransactionsProvider>
    );
};

export default Page;