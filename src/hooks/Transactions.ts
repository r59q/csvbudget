import useCSVRows from "@/hooks/CSVRows";
import {MappedCSVRow, Transaction, TransactionID, TransactionLinkDescriptor, TransactionType} from "@/model";
import useCategories from "@/hooks/Categories";
import {getDayJs, getEnvelope} from "@/utility/datautils";
import useIncome from "@/hooks/Income";
import {useGlobalContext} from "@/context/GlobalContext";
import {getTransactionLinksData, getTransactionTypeMapData} from "@/data";
import {useEffect, useState} from "react";

const useTransactions = () => {
    const {isAccountOwned, accountValueMappings, getCategory} = useGlobalContext();
    const {mappedCSVRows} = useCSVRows();
    const {incomeMap, getEnvelopeForIncome} = useIncome();
    const transactionLinksStore = getTransactionLinksData();
    const transactionTypeMapStore = getTransactionTypeMapData();
    const [storedLinks, setStoredLinks] = useState<Record<number, TransactionLinkDescriptor[]>>({});
    const [transactionTypeMap, setTransactionTypeMap] = useState<Record<TransactionID, TransactionType>>({});

    useEffect(() => {
        setStoredLinks(transactionLinksStore.load());
        setTransactionTypeMap(transactionTypeMapStore.load());
    }, []);

    const setTransactionLink = (a: Transaction, b: Transaction) => {
        setStoredLinks(prev => {
            const newLinks = {...prev};
            // Add link for a -> b
            if (!newLinks[a.id]) newLinks[a.id] = [];
            if (!newLinks[a.id].some(l => l.linkedId === b.id)) {
                newLinks[a.id] = [...newLinks[a.id], {linkedId: b.id, linkType: "unknown"}];
            }
            // Add link for b -> a
            if (!newLinks[b.id]) newLinks[b.id] = [];
            if (!newLinks[b.id].some(l => l.linkedId === a.id)) {
                newLinks[b.id] = [...newLinks[b.id], {linkedId: a.id, linkType: "unknown"}];
            }
            transactionLinksStore.save(newLinks);
            return newLinks;
        });
    };

    const unsetTransactionLink = (a: Transaction, b: Transaction) => {
        setStoredLinks(prev => {
            const newLinks = {...prev};
            // Remove link for a -> b
            if (newLinks[a.id]) {
                newLinks[a.id] = newLinks[a.id].filter(l => l.linkedId !== b.id);
                if (newLinks[a.id].length === 0) delete newLinks[a.id];
            }
            // Remove link for b -> a
            if (newLinks[b.id]) {
                newLinks[b.id] = newLinks[b.id].filter(l => l.linkedId !== a.id);
                if (newLinks[b.id].length === 0) delete newLinks[b.id];
            }
            transactionLinksStore.save(newLinks);
            return newLinks;
        });
    };

    const setTransactionLinkType = (a: Transaction, b: Transaction, linkType: TransactionLinkDescriptor['linkType']) => {
        setStoredLinks(prev => {
            const newLinks = {...prev};
            // Update link for a -> b
            if (newLinks[a.id]) {
                newLinks[a.id] = newLinks[a.id].map(l =>
                    l.linkedId === b.id ? {...l, linkType} : l
                );
            }
            // Update link for b -> a
            if (newLinks[b.id]) {
                newLinks[b.id] = newLinks[b.id].map(l =>
                    l.linkedId === a.id ? {...l, linkType} : l
                );
            }
            transactionLinksStore.save(newLinks);
            return newLinks;
        });
    };

    const setTransactionType = (id: TransactionID, type: TransactionType) => {
        setTransactionTypeMap(prev => {
            const newTypeMap = {...prev, [id]: type};
            if (type === "unknown") {
                delete newTypeMap[id]
            }
            transactionTypeMapStore.save(newTypeMap);
            return newTypeMap;
        });
    };

    const setTransactionTypes = (ids: TransactionID[], type: TransactionType) => {
        setTransactionTypeMap(prev => {
            const newTypeMap = {...prev};
            ids.forEach(id => {
                newTypeMap[id] = type;
                if (type === "unknown") {
                    delete newTypeMap[id];
                }
            });
            transactionTypeMapStore.save(newTypeMap);
            return newTypeMap;
        });
    };

    const isIncome = (id: TransactionID) => {
        return Object.keys(incomeMap).map(e => parseInt(e)).includes(id);
    }

    const getMappedType = (transactionId: TransactionID): TransactionType => {
        return transactionTypeMap[transactionId] ?? "unknown"
    }

    const transactions = mappedCSVRows.map(mappedRow => {
        const id = mappedRow.mappedId;
        const amount = mappedRow.mappedAmount;
        const originalTo = mappedRow.mappedTo;
        const mappedTo = accountValueMappings[originalTo];
        const originalFrom = mappedRow.mappedFrom;
        const mappedFrom = accountValueMappings[originalFrom];
        const isTransfer = isAccountOwned(originalTo) && isAccountOwned(originalFrom);
        const guessedType = isIncome(id) ? "income" : amount < 0 ? "expense" : "unknown";
        const guessedLinks = guessLinks(mappedRow, mappedCSVRows)

        let transactionType = getMappedType(id);
        if (transactionType === "unknown") {
            transactionType = (!isTransfer && guessedLinks.length === 0) ? guessedType : "unknown";
        }

        const transaction: Transaction = {
            id,
            amount,
            from: originalFrom,
            mappedFrom: mappedFrom ? mappedFrom : undefined,
            to: originalTo,
            mappedTo: mappedTo ? mappedTo : undefined,
            category: getCategory(id) ?? "Unassigned",
            guessedCategory: undefined,
            linkedTransactions: storedLinks[id] || [],
            guessedLinkedTransactions: guessedLinks,
            date: getDayJs(mappedRow.mappedDate),
            isTransfer,
            notes: "",
            text: mappedRow.mappedText,
            guessedType: guessedType,
            type: transactionType,
            envelope: getEnvelopeForIncome(id) ?? getEnvelope(mappedRow.mappedDate)
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

    const getUncategorizedTransactionsLike = (transaction: Transaction) => {
        return transactions
            .filter(tran => {
                if (tran.id === transaction.id) {
                    return false; // Skip the same transaction
                }
                if (tran.category !== "Unassigned") {
                    return false; // Only consider uncategorized transactions
                }
                // Find transactions that seem similar to the given transaction
                if (tran.text === transaction.text) {
                    return true;
                }
                return Math.abs(tran.amount) === Math.abs(transaction.amount);
            })
    }

    return {
        transactions,
        getTransactions,
        setTransactionLink,
        unsetTransactionLink,
        setTransactionLinkType,
        setTransactionType,
        setTransactionTypes,
        getUnmappedTransactionsLike,
        getUncategorizedTransactionsLike
    };
};

const guessLinks = (guessingRow: MappedCSVRow, rows: MappedCSVRow[]): TransactionLinkDescriptor[] => {
    const amount = guessingRow.mappedAmount;
    return rows.filter(row => {
        if (-row.mappedAmount !== amount) {
            return false;
        }
        const rowDate = getDayJs(row.mappedDate);
        const guessingRowDate = getDayJs(guessingRow.mappedDate);
        const dayDiff = rowDate.diff(guessingRowDate, "day");
        return dayDiff < 35;
    }).map(row => ({linkedId: row.mappedId, linkType: "unknown"}))
}

export default useTransactions;