import useCSVRows from "@/hooks/CSVRows";
import {Envelope, MappedCSVRow, Transaction, TransactionID, TransactionLinkDescriptor, TransactionType} from "@/model";
import {getDayJs, getEnvelopeFromDate, predictEnvelope, predictIsCsvRowTransfer} from "@/utility/datautils";
import useIncome from "@/hooks/Income";
import {useGlobalContext} from "@/context/GlobalContext";
import {getSelectedEnvelopesData, getTransactionLinksData, getTransactionTypeMapData} from "@/data";
import {useEffect, useMemo, useState} from "react";

const useTransactions = () => {
    const {isAccountOwned, accountValueMappings, getCategory, categoryMap} = useGlobalContext();
    const {mappedCSVRows} = useCSVRows();
    const {incomeMap, getEnvelopeForIncome} = useIncome();
    const transactionLinksStore = getTransactionLinksData();
    const transactionTypeMapStore = getTransactionTypeMapData();
    const [storedLinks, setStoredLinks] = useState<Record<number, TransactionLinkDescriptor[]>>({});
    const [transactionTypeMap, setTransactionTypeMap] = useState<Record<TransactionID, TransactionType>>({});
    const [selectedEnvelopes, setSelectedEnvelopes] = useState<Envelope[]>([]);

    const categoryPredictionIndex = useMemo(() => {
        const index: Record<string, string> = {};
        Object.keys(categoryMap).forEach(tranId => {
            const csvRow = mappedCSVRows.find(row => row.mappedId === parseInt(tranId));
            if (csvRow) {
                const category = getCategory(parseInt(tranId));
                if (category !== "Unassigned") {
                    index[csvRow.mappedText] = category;
                }
            }
        })
        return index;
    }, [categoryMap]);

    useEffect(() => {
        setStoredLinks(transactionLinksStore.load());
        setTransactionTypeMap(transactionTypeMapStore.load());
        setSelectedEnvelopes(getSelectedEnvelopesData().load());
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

    const isIncomeMapped = (id: TransactionID) => {
        return Object.keys(incomeMap).map(e => parseInt(e)).includes(id);
    }

    const getMappedType = (transactionId: TransactionID): TransactionType => {
        return transactionTypeMap[transactionId] ?? "unknown"
    }

    const transactions = mappedCSVRows.map(mappedRow => {
        const id = mappedRow.mappedId;
        const amount = mappedRow.mappedAmount;
        const dateDayJs = getDayJs(mappedRow.mappedDate);
        const originalTo = mappedRow.mappedTo;
        const mappedTo = accountValueMappings[originalTo];
        const originalFrom = mappedRow.mappedFrom;
        const mappedFrom = accountValueMappings[originalFrom];
        const isTransfer = predictIsCsvRowTransfer(mappedRow, isAccountOwned);
        const guessedType = isIncomeMapped(id) ? "income" : amount < 0 ? "expense" : "unknown";
        const guessedLinks = predictLinks(mappedRow, mappedCSVRows)
        const guessedCategory = categoryPredictionIndex[mappedRow.mappedText] ?? "Unassigned";

        let transactionType = getMappedType(id);
        if (transactionType === "unknown") {
            transactionType = (!isTransfer && guessedLinks.length === 0) ? guessedType : "unknown";
        }

        // If the transaction is a transfer or expense, we don't guess the envelope
        const guessedEnvelope = transactionType === "income" ?
            (getEnvelopeForIncome(id) ?? predictEnvelope(dateDayJs))
            : getEnvelopeFromDate(dateDayJs);

        const getEnvelope = () => {
            if (transactionType === "income") {
                return getEnvelopeForIncome(id) ?? "Unassigned";
            } else {
                return getEnvelopeFromDate(dateDayJs);
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
            guessedEnvelope: guessedEnvelope,
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
        transactions.forEach(tran => {
            if (tran.envelope) {
                envelopeSet.add(tran.envelope);
            }
        });
        return Array.from(envelopeSet).sort();
    }, [transactions]).reverse();

    const saveSelectedEnvelopes = (envelopes: Envelope[]) => {
        setSelectedEnvelopes(getSelectedEnvelopesData().save(envelopes));
    }

    const toggleSelectedEnvelope = (envelope: Envelope) => {
        setSelectedEnvelopes(prev => {
            const newEnvelopes = prev.includes(envelope) ? prev.filter(e => e !== envelope) : [...prev, envelope];
            return getSelectedEnvelopesData().save(newEnvelopes);
        });
    }

    const isEnvelopeSelected = (envelope: Envelope) => {
        return selectedEnvelopes.includes(envelope);
    }

    return {
        envelopes,
        transactions,
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
        isEnvelopeSelected
    };
};

const predictLinks = (guessingRow: MappedCSVRow, rows: MappedCSVRow[]): TransactionLinkDescriptor[] => {
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