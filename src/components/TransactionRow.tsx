import React from "react";
import {Transaction, TransactionType} from "@/model";
import IDField from "@/components/fields/IDField";
import AccountField from "@/components/fields/AccountField";
import DateField from "@/components/fields/DateField";
import TextField from "@/components/fields/TextField";
import AmountField from "@/components/fields/AmountField";
import MappingField from "@/components/fields/MappingField";

interface TransactionRowProps {
    transaction: Transaction;
    mappedType: string | undefined;
}

const TRANSACTION_TYPES: TransactionType[] = ["income", "expense", "refund", "unknown"];

const TransactionRow: React.FC<TransactionRowProps> = ({transaction}) => {

    return (
        <tr key={transaction.id}>
            <td className="p-2 border"><IDField transaction={transaction}/></td>
            <td className="p-2 border"><DateField transaction={transaction}/></td>
            <td className="p-2 border"><TextField transaction={transaction}/></td>
            <td className="p-2 border"><AmountField transaction={transaction}/></td>
            <td className="p-2 border w-50"><AccountField account={transaction.mappedFrom}/></td>
            <td className="p-2 border w-50"><AccountField account={transaction.mappedTo}/></td>
            <td className="p-2 border">
                <MappingField transaction={transaction} />
            </td>
        </tr>
    );
};

export default TransactionRow;
