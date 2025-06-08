"use client";

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {advancedFilters, loadCsvs, MappedCsvRow} from "@/utility/csvutils";
import {CsvRowId, formatCurrency} from "@/utility/datautils";
import dayjs from "dayjs";

interface RowIncomeMap extends Record<CsvRowId, string> {
} // Row id to month
const Page = () => {
    const [csvRows, setCsvRows] = useState<MappedCsvRow[]>([]);
    const [incomeRowMap, setIncomeRowMap] = useState<RowIncomeMap>({});
    const [ownAccounts, setOwnAccounts] = useState<string[]>([])

    const newCategoryInputRef = useRef<HTMLInputElement | null>(null)

    const getAssignedMonth = (row: MappedCsvRow) => {
        return incomeRowMap[row.mappedId] ?? "";
    }

    const updateIncomeMonth = (row: MappedCsvRow, month: string) => {
        const newMap = {...incomeRowMap}
        newMap[row.mappedId] = month;
        saveMap(newMap);
        setIncomeRowMap(newMap);
    }

    useEffect(() => {
        const loaded = loadCsvs();
        setCsvRows(loaded);
        setOwnAccounts(JSON.parse(localStorage.getItem("own_accounts") ?? "[]"))

        const savedMap = localStorage.getItem('row_income_map');
        if (savedMap) setIncomeRowMap(JSON.parse(savedMap));
    }, []);

    const saveMap = (map: RowIncomeMap) => {
        setIncomeRowMap(map);
        localStorage.setItem('row_income_map', JSON.stringify(map));
    };

    const filteredRows: MappedCsvRow[] = useMemo(() => csvRows.filter(e => {
        return !(ownAccounts.includes(e.mappedFrom) && ownAccounts.includes(e.mappedTo));
    }).filter(advancedFilters).toSorted((a, b) => {
        const aDate = dayjs(a.mappedDate, 'DD-MM-YYYY');
        const bDate = dayjs(b.mappedDate, 'DD-MM-YYYY');
        return bDate.unix() - aDate.unix()
    }), [csvRows])

    const unfilteredRows = useMemo(() => csvRows.filter((e => {
        return (!ownAccounts.includes(e.mappedFrom) || ownAccounts.includes(e.mappedTo)) || !advancedFilters(e)
    })), [csvRows, ownAccounts])


    const groupedByMonth: Record<string, MappedCsvRow[] | undefined> = useMemo(() => Object.groupBy(filteredRows, row => {
        return dayjs(row.mappedDate, 'DD-MM-YYYY').format("MMMM YYYY");
    }), [filteredRows]);
    const months = Object.keys(groupedByMonth);

    if (filteredRows.length === 0) {
        return <></>
    }

    const latestDate = dayjs(filteredRows[0].mappedDate, 'DD-MM-YYYY');
    const earliestDate = dayjs(filteredRows[filteredRows.length - 1].mappedDate, 'DD-MM-YYYY');
    const durationDays = latestDate.diff(earliestDate, 'days');

    const incomeRows = csvRows.filter(csvRow => Object.keys(incomeRowMap).includes(csvRow.mappedId.toString()))


    const monthlyIncomeRows = Object.groupBy(incomeRows, row => incomeRowMap[row.mappedId]);
    const averageIncome = months.map(month => {
        const incomeRows = monthlyIncomeRows[month] ?? [];
        return incomeRows.map(row => parseFloat(row.mappedAmount)).reduce((pre, cur) => pre + cur, 0);
    }).reduce((pre, cur) => pre + cur, 0) / months.length

    return (
        <div className={"p-2"}>
            <div>
                <p>Average Income: {formatCurrency(averageIncome)}</p>
                {months.map(month => {
                    const rows = monthlyIncomeRows[month];
                    if (!rows) return null;
                    return <div>
                        <p>{month}</p>
                        {rows.map(row => <span key={row.mappedId}>
                            {formatCurrency(parseFloat(row.mappedAmount))}
                        </span>)}
                    </div>;
                })}
            </div>
            <table className="w-full text-sm text-left text-gray-300 border border-gray-700 rounded-lg overflow-hidden">
                <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
                <tr>
                    <th className="px-4 py-2 border-b border-gray-700">Date</th>
                    <th className="px-4 py-2 border-b border-gray-700">Posting</th>
                    <th className="px-4 py-2 border-b border-gray-700 text-right">Amount</th>
                    <th className="px-4 py-2 border-b border-gray-700">Assigned Month</th>
                </tr>
                </thead>
                <tbody>
                {unfilteredRows.map((row) => {
                    const assignedMonth = getAssignedMonth(row);
                    return (
                        <tr
                            key={row.mappedId}
                            className="hover:bg-gray-800 transition-colors duration-150"
                        >
                            <td className="px-4 py-2 border-b border-gray-700">
                                {row.mappedDate}
                            </td>
                            <td className="px-4 py-2 border-b border-gray-700">
                                {row.mappedPosting}
                            </td>
                            <td className="px-4 py-2 border-b border-gray-700 text-right">
                                {row.mappedAmount}
                            </td>
                            <td className="px-4 py-2 border-b border-gray-700">
                                <select
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    onClick={(e) => e.stopPropagation()}
                                    value={assignedMonth}
                                    onChange={(e) => updateIncomeMonth(row, e.target.value)}
                                >
                                    <option value="">Unassigned</option>
                                    {months.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default Page;