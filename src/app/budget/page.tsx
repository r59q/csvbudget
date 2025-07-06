"use client";
import React, {useMemo, useState} from 'react';
import useBudget from "@/hooks/Budget";
import {formatCurrency, getSum, groupByEnvelope} from "@/utility/datautils";
import useCategories from "@/hooks/Categories";
import {BudgetPost, CategoryBudgetPostMap, Envelope, Transaction} from "@/model";
import {TransactionsProvider, useTransactionsContext} from "@/context/TransactionsContext";
import BudgetPage from "@/features/BudgetPage";

const Page = () => {
    return (
        <TransactionsProvider>
            <BudgetPage/>
        </TransactionsProvider>
    );
};

export default Page;
