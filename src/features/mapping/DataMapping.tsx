import React from 'react';
import BackdropBlur from "@/components/BackdropBlur";
import SchemaMapper from "@/features/mapping/SchemaMapper";
import TransactionMapper from "@/features/mapping/TransactionMapper";
import {useTransactionsContext} from "@/context/TransactionsContext";
import TransactionSelectTable from "@/components/fields/TransactionSelectTable";
import TransactionTable, {TransactionTableColumn} from "@/features/transaction/TransactionTable";
import {ColumnMapping, SchemaKey} from "@/utility/csvutils";
import {Transaction, TransactionID, TransactionType, UnmappedSchema} from "@/model";

interface DataMappingProps {
    unmappedSchemas: UnmappedSchema[];
    onSaveMapping: (mapping: ColumnMapping, schemaKey: SchemaKey) => void
    onCloseInitialImport: () => void;
    isInitialImport: boolean;
}

const DataMapping = ({unmappedSchemas, onSaveMapping, onCloseInitialImport, isInitialImport}: DataMappingProps) => {
    const {transactions, setTransactionTypes} = useTransactionsContext();
    const groupedByType = Object.groupBy(transactions, e => e.type);
    const groupedByCategory = Object.groupBy(transactions, e => e.category);

    const unknownTypeTransactions = (groupedByType.unknown ?? []).filter(tra => !tra.isTransfer);
    const hasUnknownTypeTransactions = unknownTypeTransactions.length > 0
    const uncategorizedExpenses = (groupedByCategory['Unassigned'] ?? []).filter(tran => tran.type === "expense");
    const hasUncategorizedTransactions = uncategorizedExpenses.length > 0;
    const hasExpenseWithPositiveAmount = uncategorizedExpenses.some(tran => tran.amountAfterRefund > 0);

    if (unmappedSchemas.length > 0) {
        return <BackdropBlur>
            <SchemaMapper unmappedSchema={unmappedSchemas[0]} onSaveMapping={onSaveMapping}/>
        </BackdropBlur>
    }

    const setConfirmedTypes = (txIds: TransactionID[]) => {
        const confirmedTransactions = transactions.filter(e => txIds.includes(e.id))
        const confirmedTxByGuess = Object.groupBy(confirmedTransactions, e => e.guessedType);
        Object.keys(confirmedTxByGuess).forEach(guess => {
            const guessedType = guess as TransactionType;
            setTransactionTypes(confirmedTxByGuess[guessedType]?.map(e => e.id) ?? [], guessedType);
        })
        onCloseInitialImport(); // Finish off by closing the dialog
    }

    const unknownTypeTransactionsWithGuessedType = unknownTypeTransactions.filter(tran => tran.guessedType !== "unknown")
    if (isInitialImport && unknownTypeTransactionsWithGuessedType.length > 0) {
        return <BackdropBlur onClose={onCloseInitialImport}>
            <div className="p-4 bg-gray-900 rounded-md flex flex-col gap-4 max-w-7xl w-full mx-auto">
                <h1 className="font-bold text-xl">Initial Import</h1>
                <p className="text-sm text-gray-400">Review your imported transactions below. You can close this dialog to continue.</p>
                <TransactionSelectTable
                    transactions={unknownTypeTransactionsWithGuessedType}
                    initialSelectedIds={unknownTypeTransactionsWithGuessedType.map(t => t.id)}
                    onConfirm={setConfirmedTypes}
                    onCancel={onCloseInitialImport}
                    additionalColumns={[{title: "Guess", cell: (t => <span className={"font-bold"}>{t.guessedType}</span>)}]}
                />
            </div>
        </BackdropBlur>
    }

    if (hasUnknownTypeTransactions) {
        return <BackdropBlur>
            <div className="p-4 bg-gray-900 rounded-md flex flex-col gap-4 max-w-7xl w-full mx-auto">
                <TransactionMapper transactions={unknownTypeTransactions}/>
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