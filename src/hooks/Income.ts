import {useEffect, useState} from "react";
import {Envelope, EnvelopeMap, Transaction, TransactionID} from "@/model";
import {getRowIncomeData} from "@/data";

const useEnvelopeMapping = () => {
    const [envelopeMap, setEnvelopeMap] = useState<EnvelopeMap>({})

    useEffect(() => {
        setEnvelopeMap(getRowIncomeData().load())
    }, []);

    const saveIncomeMap = (map: EnvelopeMap) => {
        setEnvelopeMap(getRowIncomeData().save(map));
    }

    const getEnvelopeForTransaction = (transactionId: TransactionID): Envelope => {
        const envelope = envelopeMap[transactionId];
        if (envelope === "") {
            return "Unassigned";
        }
        return envelope;
    };

    const setEnvelopeForTransaction = (row: Transaction, envelope: Envelope | "" | undefined) => {
        console.log(envelope)
        const newState = {...envelopeMap};
        if (envelope === "" || envelope == undefined || envelope === "Unassigned") {
            delete newState[row.id];
        } else {
            newState[row.id] = envelope;
        }
        saveIncomeMap(newState);
    };
    return {
        incomeMap: envelopeMap,
        getEnvelopeForTransaction,
        setEnvelopeForTransaction
    }
};

export default useEnvelopeMapping;