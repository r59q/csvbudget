import React from 'react';
import BackdropBlur from "@/components/BackdropBlur";
import SchemaMapper from "@/features/mapping/SchemaMapper";
import TransactionMapper from "@/features/mapping/TransactionMapper";
import {useTransactionsContext} from "@/context/TransactionsContext";
import TransactionTable, {TransactionTableColumn} from "@/features/transaction/TransactionTable";
import {ColumnMapping, SchemaKey} from "@/utility/csvutils";
import {UnmappedSchema} from "@/model";

interface DataMappingProps {
    unmappedSchemas: UnmappedSchema[];
    onSaveMapping: (mapping: ColumnMapping, schemaKey: SchemaKey) => void
    onCloseInitialImport: () => void;
    isInitialImport: boolean;
}

const DataMapping = ({unmappedSchemas, onSaveMapping, onCloseInitialImport, isInitialImport}: DataMappingProps) => {
    const {transactions} = useTransactionsContext();
    const groupedByType = Object.groupBy(transactions, e => e.type);
    const groupedByCategory = Object.groupBy(transactions, e => e.category);

    const unknownTransactions = (groupedByType.unknown ?? []).filter(tra => !tra.isTransfer);
    const hasUnknownTransactions = unknownTransactions.length > 0
    const uncategorizedExpenses = (groupedByCategory['Unassigned'] ?? []).filter(tran => tran.type === "expense");
    const hasUncategorizedTransactions = uncategorizedExpenses.length > 0;
    const hasExpenseWithPositiveAmount = uncategorizedExpenses.some(tran => tran.amountAfterRefund > 0);

    if (unmappedSchemas.length > 0) {
        return <BackdropBlur>
            <SchemaMapper unmappedSchema={unmappedSchemas[0]} onSaveMapping={onSaveMapping}/>
        </BackdropBlur>
    }

    if (isInitialImport) {
        return <BackdropBlur onClose={onCloseInitialImport}>
            <div className="p-4 bg-gray-900 rounded-md flex flex-col gap-4 max-w-7xl w-full mx-auto">
                <h1 className="font-bold text-xl">Initial Import</h1>
                <p className="text-sm text-gray-400">Review your imported transactions below. You can close this dialog to continue.</p>
                <TransactionTable pageSize={10} transactions={transactions} visibleColumns={["id", "date", "text", "amount", "type", "category"]} />
            </div>
        </BackdropBlur>
    }

    if (hasUnknownTransactions) {
        return <BackdropBlur>
            <div className="p-4 bg-gray-900 rounded-md flex flex-col gap-4 max-w-7xl w-full mx-auto">
                <TransactionMapper transactions={unknownTransactions}/>
            </div>
        </BackdropBlur>
    }

    if (hasUncategorizedTransactions ) {
        const visibleColumns: TransactionTableColumn[] = ["id", "date", "text", "amount","type", "category"];
        const visibleColumnsWithoutType: TransactionTableColumn[] = ["id", "date", "text", "amount", "category"];
        return <BackdropBlur>
            <div className="p-4 bg-gray-900 rounded-md flex flex-col gap-4 max-w-7xl w-full mx-auto">
                <h1 className={"font-bold text-xl"}>Categorize Expenses</h1>
                <p className={"text-sm text-gray-400"}>All transactions have been marked as expenses or incomes. Please assign a category to your expenses.</p>
                <TransactionTable pageSize={10} transactions={uncategorizedExpenses}
                                  visibleColumns={hasExpenseWithPositiveAmount ? visibleColumns : visibleColumnsWithoutType}/>
            </div>
        </BackdropBlur>
    }

    return (
        <>

        </>
    );
};


export default DataMapping;