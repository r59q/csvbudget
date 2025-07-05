import useCSVRows from "@/hooks/CSVRows";
import {Envelope, MappedCSVRow, Transaction, TransactionID, TransactionLinkDescriptor, TransactionType} from "@/model";
import {
    compareEnvelopesByDate,
    getDayJs,
    getEnvelopeFromDayjs,
    predictEnvelope,
    predictIsCsvRowTransfer
} from "@/utility/datautils";
import useEnvelopeMapping from "@/hooks/Income";
import {useGlobalContext} from "@/context/GlobalContext";
import useCategoryPredictionIndex from "@/hooks/useCategoryPredictionIndex";
import useTransactionLinks from "@/hooks/useTransactionLinks";
import useTransactionTypeMap from "@/hooks/useTransactionTypeMap";
import useSelectedEnvelopes from "@/hooks/useSelectedEnvelopes";
import {useMemo} from "react";

const useTransactions = () => {
    const {isAccountOwned, accountValueMappings, getCategory, categoryMap} = useGlobalContext();
    const {mappedCSVRows, dateFormat} = useCSVRows();
    const categoryPredictionIndex = useCategoryPredictionIndex(categoryMap, mappedCSVRows, getCategory);
    const {storedLinks, setTransactionLink, unsetTransactionLink, setTransactionLinkType} = useTransactionLinks();
    const {transactionTypeMap, setTransactionType, setTransactionTypes} = useTransactionTypeMap();
    const {
        selectedEnvelopes,
        saveSelectedEnvelopes,
        toggleSelectedEnvelope,
        isEnvelopeSelected
    } = useSelectedEnvelopes();
    const {incomeMap, getEnvelopeForTransaction, setEnvelopeForTransaction} = useEnvelopeMapping();

    const isIncomeMapped = (id: TransactionID) => {
        return Object.keys(incomeMap).map(e => parseInt(e)).includes(id);
    }

    const getMappedType = (transactionId: TransactionID): TransactionType => {
        return transactionTypeMap[transactionId] ?? "unknown"
    }

    const transactions = mappedCSVRows.map(mappedRow => {
        const id = mappedRow.mappedId;
        const amount = mappedRow.mappedAmount;
        const dateDayJs = getDayJs(mappedRow.mappedDate, dateFormat);
        const originalTo = mappedRow.mappedTo;
        const mappedTo = accountValueMappings[originalTo];
        const originalFrom = mappedRow.mappedFrom;
        const mappedFrom = accountValueMappings[originalFrom];
        const isTransfer = predictIsCsvRowTransfer(mappedRow, isAccountOwned);
        const guessedType = isIncomeMapped(id) ? "income" : amount < 0 ? "expense" : "unknown";
        const guessedLinks = predictLinks(mappedRow, mappedCSVRows, dateFormat)
        const guessedCategory = categoryPredictionIndex[mappedRow.mappedText] ?? "Unassigned";

        let transactionType = getMappedType(id);
        if (transactionType === "unknown") {
            transactionType = (!isTransfer && guessedLinks.length === 0) ? guessedType : "unknown";
        }

        // If the transaction is a transfer or expense, we don't guess the envelope
        const guessedEnvelope = transactionType === "income" ?
            (getEnvelopeForTransaction(id) ?? predictEnvelope(dateDayJs))
            : getEnvelopeFromDayjs(dateDayJs);

        const getEnvelope = () => {
            if (transactionType === "income") {
                return getEnvelopeForTransaction(id) ?? "Unassigned";
            } else {
                return getEnvelopeFromDayjs(dateDayJs);
            }
        }

        const transaction: Transaction = {
            id,
            amount,
            from: originalFrom,
            mappedFrom: mappedFrom ? mappedFrom : undefined,
            to: originalTo,
            mappedTo: mappedTo ? mappedTo : undefined,
            category: getCategory(id) ?? "Unassigned",
            guessedCategory: guessedCategory,
            linkedTransactions: storedLinks[id] || [],
            guessedLinkedTransactions: guessedLinks,
            date: dateDayJs,
            isTransfer,
            notes: "",
            text: mappedRow.mappedText,
            guessedType: guessedType,
            type: transactionType,
            envelope: getEnvelope(),
            guessedEnvelope: guessedEnvelope
        };
        return transaction;
    })

    const getTransactions = (ids: TransactionID[]) => {
        return transactions.filter(e => ids.includes(e.id));
    }

    const getUnmappedTransactionsLike = (transaction: Transaction) => {
        return transactions
            .filter(tran => {
                if (tran.id === transaction.id) {
                    return false; // Skip the same transaction
                }
                if (tran.type !== "unknown") {
                    return false;
                }
                // Find transactions that seem similar to the given transaction
                if (tran.text === transaction.text) {
                    return true;
                }
                return Math.abs(tran.amount) === Math.abs(transaction.amount) && tran.date.isSame(transaction.date, "day");
            })
    }

    const getUncategorizedExpenseTransactionsLike = (transaction: Transaction) => {
        return transactions
            .filter(tran => {
                if (tran.id === transaction.id) {
                    return false; // Skip the same transaction
                }
                if (tran.category !== "Unassigned") {
                    return false; // Only consider uncategorized transactions
                }
                if (tran.type !== "expense") {
                    return false; // Only consider expense transactions
                }
                // Find transactions that seem similar to the given transaction
                if (tran.text === transaction.text) {
                    return true;
                }
                return Math.abs(tran.amount) === Math.abs(transaction.amount);
            })
    }

    const envelopes = useMemo(() => {
        const envelopeSet = new Set<string>();
        // Add from transactions
        transactions.forEach(tran => {
            if (tran.date) {
                envelopeSet.add(getEnvelopeFromDayjs(tran.date));
            }
        });
        // Add from income map
        Object.values(incomeMap).forEach(env => {
            envelopeSet.add(env);
        });
        // Sort envelopes by date (format MM-YYYY) using utility function
        return Array.from(envelopeSet).sort(compareEnvelopesByDate);
    }, [transactions]).reverse();

    const envelopeSelectedTransactions = useMemo(() => {
        return transactions.filter(tran => isEnvelopeSelected(tran.envelope));
    }, [transactions, isEnvelopeSelected]);

    const incomeTransactions = useMemo(() => {
        return transactions.filter(tran => tran.type === "income");
    }, [transactions]);

    const incomeTransactionsGroupedByEnvelope: Partial<Record<Envelope, Transaction[]>> = Object.groupBy(incomeTransactions, row => getEnvelopeForTransaction(row.id));

    const envelopeSelectedIncomeTransactions = useMemo(() => {
        return incomeTransactions.filter(tran => isEnvelopeSelected(tran.envelope));
    }, [incomeTransactions, isEnvelopeSelected]);

    return {
        getEnvelopeForTransaction,
        setEnvelopeForTransaction,
        envelopes,
        selectedEnvelopes,
        incomeTransactions,
        envelopeSelectedIncomeTransactions,
        transactions,
        envelopeSelectedTransactions,
        getTransactions,
        setTransactionLink,
        unsetTransactionLink,
        setTransactionLinkType,
        setTransactionType,
        setTransactionTypes,
        getUnmappedTransactionsLike,
        getUncategorizedExpenseTransactionsLike,
        saveSelectedEnvelopes,
        toggleSelectedEnvelope,
        isEnvelopeSelected,
        incomeTransactionsGroupedByEnvelope
    };
};

const predictLinks = (guessingRow: MappedCSVRow, rows: MappedCSVRow[], dateFormat: string): TransactionLinkDescriptor[] => {
    const amount = guessingRow.mappedAmount;
    return rows.filter(row => {
        if (-row.mappedAmount !== amount) {
            return false;
        }
        const rowDate = getDayJs(row.mappedDate, dateFormat);
        const guessingRowDate = getDayJs(guessingRow.mappedDate, dateFormat);
        const dayDiff = rowDate.diff(guessingRowDate, "day");
        return dayDiff < 35;
    }).map(row => ({linkedId: row.mappedId, linkType: "unknown"}))
}

export default useTransactions;
