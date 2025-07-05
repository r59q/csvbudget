import { useState, useEffect } from "react";
import { TransactionID, TransactionType } from "@/model";
import { getTransactionTypeMapData } from "@/data";

export default function useTransactionTypeMap() {
    const [transactionTypeMap, setTransactionTypeMap] = useState<Record<TransactionID, TransactionType>>({});

    useEffect(() => {
        const transactionTypeMapStore = getTransactionTypeMapData();
        setTransactionTypeMap(transactionTypeMapStore.load());
    }, []);

    const setTransactionType = (id: TransactionID, type: TransactionType) => {
        const transactionTypeMapStore = getTransactionTypeMapData();
        setTransactionTypeMap(prev => {
            const newTypeMap = { ...prev, [id]: type };
            if (type === "unknown") {
                delete newTypeMap[id];
            }
            transactionTypeMapStore.save(newTypeMap);
            return newTypeMap;
        });
    };

    const setTransactionTypes = (ids: TransactionID[], type: TransactionType) => {
        const transactionTypeMapStore = getTransactionTypeMapData();
        setTransactionTypeMap(prev => {
            const newTypeMap = { ...prev };
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

    return {
        transactionTypeMap,
        setTransactionType,
        setTransactionTypes,
    };
}
