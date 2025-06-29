import {useEffect, useState} from "react";
import {MappedCSVRow, Envelope, IncomeEnvelopeMap, Transaction, TransactionID} from "@/model";
import {getRowIncomeData} from "@/data";
import useCSVRows from "@/hooks/CSVRows";

const useIncome = () => {
    const {getById} = useCSVRows()
    const [incomeMap, setIncomeMap] = useState<IncomeEnvelopeMap>({})

    useEffect(() => {
        setIncomeMap(getRowIncomeData().load())
    }, []);

    const saveIncomeMap = (map: IncomeEnvelopeMap) => {
        setIncomeMap(getRowIncomeData().save(map));
    }

    const incomeRows = Object.keys(incomeMap).map(rowId => getById(parseInt(rowId))).filter(e => !!e);

    return {
        incomeMap,
        incomeRows,
        getEnvelopeForIncome: (transactionId: TransactionID): Envelope => {
            const month = incomeMap[transactionId];
            if (month === "") {
                return "Unassigned";
            }
            return month;
        },
        setEnvelopeForIncome: (row: Transaction, envelope: Envelope | "" | undefined) => {
            const newState = {...incomeMap};
            if (envelope === "" || envelope == undefined || envelope === "Unassigned") {
                delete newState[row.id];
            } else {
                newState[row.id] = envelope;
            }
            saveIncomeMap(newState);
        }
    }
};

export default useIncome;