import {useEffect, useState} from "react";
import {MappedCSVRow, Month, RowIncomeMap} from "@/model";
import {getRowIncomeData} from "@/data";
import useCSVRows from "@/hooks/CSVRows";

const useIncome = () => {
    const {mappedCSVRows, getById} = useCSVRows()
    const [incomeMap, setIncomeMap] = useState<RowIncomeMap>({})

    useEffect(() => {
        setIncomeMap(getRowIncomeData().load())
    }, []);

    const saveIncomeMap = (map: RowIncomeMap) => {
        setIncomeMap(getRowIncomeData().save(map));
    }

    const incomeRows = Object.keys(incomeMap).map(rowId => getById(parseInt(rowId))).filter(e => !!e);

    return {
        incomeMap,
        incomeRows,
        getMonthForIncome: (row: MappedCSVRow): Month | undefined => {
            const month = incomeMap[row.mappedId];
            if (month === "") {
                return undefined;
            }
            return month;
        },
        setMonthForIncome: (row: MappedCSVRow, month: Month | undefined) => {
            const newState = {...incomeMap};
            if (month === "" || month == undefined) {
                delete newState[row.mappedId];
            } else {
                newState[row.mappedId] = month;
            }
            saveIncomeMap(newState);
        }
    }
};

export default useIncome;