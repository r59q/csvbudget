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
    const hasUncategorizedTransactions = (groupedByCategory['Unassigned'] ?? []).length > 0;
    const uncategorizedTransactions = groupedByCategory['Unassigned'] ?? [];

    if (unmappedSchemas.length > 0) {
        return <BackdropBlur>
            <SchemaMapper unmappedSchema={unmappedSchemas[0]} onSaveMapping={onSaveMapping}/>
        </BackdropBlur>
    }

    if (hasUnknownTransactions) {
        return <BackdropBlur>
            <TransactionMapper transactions={unknownTransactions}/>
        </BackdropBlur>
    }

    if (hasUncategorizedTransactions) {
        return <BackdropBlur>
            <TransactionTable transactions={uncategorizedTransactions}/>
        </BackdropBlur>
    }

    return (
        <>

        </>
    );
};


export default DataMapping;