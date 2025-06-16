import useCSVRows from "@/hooks/CSVRows";
import {Transaction, TransactionID} from "@/model";
import useCategories from "@/hooks/Categories";
import {getDayJs, getEnvelope} from "@/utility/datautils";
import useIncome from "@/hooks/Income";
import {useGlobalContext} from "@/context/GlobalContext";

const useTransactions = () => {
    const {isAccountOwned, accountValueMappings} = useGlobalContext();
    const {mappedCSVRows} = useCSVRows();
    const {getCategory} = useCategories();
    const {incomeMap, getEnvelopeForIncome} = useIncome();

    const isIncome = (id: TransactionID) => {
        return Object.keys(incomeMap).map(e => parseInt(e)).includes(id);
    }

    const transactions = mappedCSVRows.map(mappedRow => {
        const id = mappedRow.mappedId;
        const amount = mappedRow.mappedAmount;
        const originalTo = mappedRow.mappedTo;
        const mappedTo = accountValueMappings[originalTo];
        const originalFrom = mappedRow.mappedFrom;
        const mappedFrom = accountValueMappings[originalFrom];
        const isTransfer = isAccountOwned(mappedTo) && isAccountOwned(mappedFrom);
        const guessedType = isIncome(id) ? "income" : amount < 0 ? "expense" : "unknown";
        const transaction: Transaction = {
            id,
            amount,
            from: originalFrom,
            mappedFrom: mappedFrom ? mappedFrom : originalFrom,
            to: originalTo,
            mappedTo: mappedTo ? mappedTo : originalTo,
            category: getCategory(mappedRow) ?? "Unassigned",
            linkedTransactions: [],
            date: getDayJs(mappedRow.mappedDate),
            isTransfer,
            notes: "",
            text: mappedRow.mappedText,
            guessedType: guessedType,
            type: !isTransfer ? guessedType : "unknown",
            envelope: getEnvelopeForIncome(id) ?? getEnvelope(mappedRow.mappedDate)
        };
        return transaction;
    })
    return {
        transactions
    };
};

export default useTransactions;