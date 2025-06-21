import React from 'react';
import BackdropBlur from "@/components/BackdropBlur";
import SchemaMapper from "@/features/mapping/SchemaMapper";
import TransactionMapper from "@/features/mapping/TransactionMapper";
import {useTransactionsContext} from "@/context/TransactionsContext";
import TransactionTable from "@/features/mapping/TransactionTable";

interface DataMappingProps {
    unmappedSchemas: any[];
    onSaveMapping: (mapping: any, schemaKey: any) => void;
}

const DataMapping = ({unmappedSchemas, onSaveMapping}: DataMappingProps) => {
    const {transactions} = useTransactionsContext();
    const groupedByType = Object.groupBy(transactions, e => e.type);
    const groupedByCategory = Object.groupBy(transactions, e => e.category);

    const unknownTransactions = (groupedByType.unknown ?? []).filter(tra => !tra.isTransfer);
    const hasUnknownTransactions = unknownTransactions.length > 0
    const uncategorizedExpenses = (groupedByCategory['Unassigned'] ?? []).filter(tran => tran.type === "expense");
    const hasUncategorizedTransactions = uncategorizedExpenses.length > 0

    if (unmappedSchemas.length > 0) {
        return <BackdropBlur>
            <SchemaMapper unmappedSchema={unmappedSchemas[0]} onSaveMapping={onSaveMapping}/>
        </BackdropBlur>
    }

    if (hasUnknownTransactions) {
        return <BackdropBlur>
            <div className="p-4 bg-gray-900 rounded-md flex flex-col gap-4 max-w-7xl w-full mx-auto">
                <TransactionMapper transactions={unknownTransactions}/>
            </div>
        </BackdropBlur>
    }

    if (hasUncategorizedTransactions) {
        return <BackdropBlur>
            <div className="p-4 bg-gray-900 rounded-md flex flex-col gap-4 max-w-7xl w-full mx-auto">
                <h1 className={"font-bold text-xl"}>Categorize Expenses</h1>
                <TransactionTable pageSize={10} transactions={uncategorizedExpenses}
                                  visibleColumns={["id", "type", "date", "text", "amount", "category"]}/>
            </div>
        </BackdropBlur>
    }

    return (
        <>

        </>
    );
};


export default DataMapping;