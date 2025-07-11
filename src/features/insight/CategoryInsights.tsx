import React from 'react';
import EnvelopeExpensesByCategory from "@/features/insight/EnvelopeExpensesByCategory";
import ExpensesByCategory from "@/features/insight/ExpensesByCategory";


const CategoryInsights = () => {
    return <div className={"flex flex-col w-full h-full"}>
        <div className={"flex-1"}>
            <EnvelopeExpensesByCategory/>
        </div>
        <div className={"flex-1"}>
            <ExpensesByCategory/>
        </div>
    </div>
}

export default CategoryInsights;