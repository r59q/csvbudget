"use client";

import {TransactionsProvider} from "@/context/TransactionsContext";
import IncomePage from "@/features/IncomePage";


const Page = () => {
    return (
        <TransactionsProvider>
            <IncomePage/>
        </TransactionsProvider>
    );
};


export default Page;
