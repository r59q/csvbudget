import useCSVRows from "@/hooks/CSVRows";
import {Transaction, TransactionID} from "@/model";
import useCategories from "@/hooks/Categories";
import {getDayJs, getEnvelope} from "@/utility/datautils";
import useOwnedAccounts from "@/hooks/OwnedAccount";
import useIncome from "@/hooks/Income";

const useTransactions = () => {
    const {mappedCSVRows} = useCSVRows();
    const {getCategory} = useCategories();
    const {isAccountOwned} = useOwnedAccounts();
    const {incomeMap, getEnvelopeForIncome} = useIncome();

    const isIncome = (id: TransactionID) => {
        return Object.keys(incomeMap).map(e => parseInt(e)).includes(id);
    }

    const transactions = mappedCSVRows.map(mappedRow => {
        const id = mappedRow.mappedId;
        const amount = mappedRow.mappedAmount;
        const transaction: Transaction = {
            id,
            amount,
            from: mappedRow.mappedFrom,
            to: mappedRow.mappedTo,
            category: getCategory(mappedRow) ?? "Unassigned",
            linkedTransactions: [],
            date: getDayJs(mappedRow.mappedDate),
            isTransfer: isAccountOwned(mappedRow.mappedTo) && isAccountOwned(mappedRow.mappedFrom),
            notes: "",
            text: mappedRow.mappedText,
            type: isIncome(id) ? "income" : amount < 0 ? "expense" : "unknown",
            envelope: getEnvelopeForIncome(id) ?? getEnvelope(mappedRow.mappedDate)
        };
        return transaction;
    })
    return {
        transactions
    };
};

export default useTransactions;