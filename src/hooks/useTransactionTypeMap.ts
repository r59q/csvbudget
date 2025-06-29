import { useState, useEffect } from "react";
import { TransactionID, TransactionType } from "@/model";
import { getTransactionTypeMapData } from "@/data";

export default function useTransactionTypeMap() {
    const transactionTypeMapStore = getTransactionTypeMapData();
    const [transactionTypeMap, setTransactionTypeMap] = useState<Record<TransactionID, TransactionType>>({});

    useEffect(() => {
        setTransactionTypeMap(transactionTypeMapStore.load());
    }, []);

    const setTransactionType = (id: TransactionID, type: TransactionType) => {
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

