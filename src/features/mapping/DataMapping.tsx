import React from 'react';
import BackdropBlur from "@/components/BackdropBlur";
import useTransactions from "@/hooks/Transactions";
import SchemaMapper from "@/features/mapping/SchemaMapper";
import TransactionMapper from "@/features/mapping/TransactionMapper";

interface DataMappingProps {
    unmappedSchemas: any[];
    onSaveMapping: (mapping: any, schemaKey: any) => void;
}

const DataMapping = ({unmappedSchemas, onSaveMapping}: DataMappingProps) => {
    const {transactions} = useTransactions();
    const groupedByType = Object.groupBy(transactions, e => e.type);
    const unknownTransactions = (groupedByType.unknown ?? []).filter(tra => !tra.isTransfer);
    const hasUnknownTransactions = unknownTransactions.length > 0
    if (unmappedSchemas.length > 0) {
        return <BackdropBlur>
            <SchemaMapper unmappedSchema={unmappedSchemas[0]} onSaveMapping={onSaveMapping}/>
        </BackdropBlur>
    }

    if (hasUnknownTransactions) {
        return <BackdropBlur>
            <TransactionMapper transactions={unknownTransactions} />
        </BackdropBlur>
    }
    return (
        <>

        </>
    );
};


export default DataMapping;