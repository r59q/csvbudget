'use client';
import React, {useMemo, useRef, useState} from 'react';
import useCSVRows from "@/hooks/CSVRows";
import useOwnedAccounts from "@/hooks/OwnedAccount";
import useCategories from "@/hooks/Categories";
import {MappedCSVRow} from "@/model";
import {advancedFilters, groupByMonth, sortedByDate} from "@/utility/datautils";

export default function ExpensesPage() {
    const {mappedCSVRows} = useCSVRows()
    const {filterIntraAccountTransaction, filterInterAccountTransaction} = useOwnedAccounts();
    const {
        setCategory,
        categories,
        getCategory,
        createCategory,
        deleteCategory,
        groupByCategory
    } = useCategories();

    const newCategoryInputRef = useRef<HTMLInputElement | null>(null)

    const updateCategory = (selectedRow: MappedCSVRow, category: string) => {
        const posting = selectedRow.mappedText;
        const rows: MappedCSVRow[] = []
        mappedCSVRows.forEach((row) => {
            if (row.mappedText === posting) {
                rows.push(row)
            }
        });
        setCategory(rows, category)
    };

    const addNewCategory = () => {
        const current = newCategoryInputRef.current;
        if (!current) return;
        const category = current.value;
        createCategory(category);
        current.value = '';
    };

    const aggregation: Record<string, number> = {};
    mappedCSVRows.forEach((row) => {
        const cat = getCategory(row);
        if (!cat) return;
        const amt = row.mappedAmount;
        aggregation[cat] = (aggregation[cat] || 0) + amt;
    });

    const sortedAggregates = Object.entries(aggregation).sort((a, b) => b[1] - a[1]);

    const filteredRows: MappedCSVRow[] = mappedCSVRows
        .filter(filterIntraAccountTransaction)
        .filter(advancedFilters)
        .toSorted(sortedByDate)

    const filteredRowsDiff = mappedCSVRows.length - filteredRows.length;
    const unfilteredRows = mappedCSVRows.filter(e => filterInterAccountTransaction(e) || !advancedFilters(e));

    const groupedByMonth = useMemo(() => groupByMonth(filteredRows), [filteredRows]);
    const groupedByCategory = groupByCategory(filteredRows);

    console.assert(unfilteredRows.length === filteredRowsDiff) // Sanity check
    return (
        <div className="flex min-h-screen">
            {/* Left Panel */}
            <div className="w-1/2 p-4 border-r overflow-y-auto">
                <h2 className="text-lg font-bold mb-2">Map Rows</h2>

                {/* Category List & Adder */}
                <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-1">Defined Categories:</h3>
                    <div className="flex flex-wrap gap-2 text-sm mb-2">
                        {categories.length ? (
                            categories.map((cat) => (
                                <span
                                    key={cat}
                                    className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded flex items-center gap-1">
                                    {cat}
                                    <button
                                        onClick={() => deleteCategory(cat)}
                                        className="text-red-500 hover:text-red-700"
                                        title={`Remove ${cat}`}>
                                        &times;
                                    </button>
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-500">No categories yet</span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <input
                            className="border px-2 py-1 rounded w-48 text-sm"
                            placeholder="New category"
                            ref={newCategoryInputRef}
                            onKeyDown={(e) => e.key === 'Enter' && addNewCategory()}
                        />
                        <button
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                            onClick={addNewCategory}
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* Table of Rows */}
                <p>Filtered {filteredRowsDiff} rows</p>
                <div className={"flex flex-col gap-8"}>
                    {Object.keys(groupedByMonth).map(month => {
                        const rows = groupedByMonth[month];
                        if (!rows) return null;
                        return <div key={month}>
                            <p key={month} className={"text-2xl"}>{month}</p>
                            <table className="text-sm w-full border">
                                <thead>
                                <tr className="bg-gray-900">
                                    <th className="p-2 border">Date</th>
                                    <th className="p-2 border">Posting</th>
                                    <th className="p-2 border">Amount</th>
                                    <th className="p-2 border">Category</th>
                                </tr>
                                </thead>
                                <tbody>
                                {rows
                                    .filter((row) => !getCategory(row) || getCategory(row) === "Unassigned")
                                    .map((row, i) => {
                                        const category = getCategory(row);
                                        return (
                                            <PostingsTableRow {...{category, categories, row}}
                                                              onSelectCategory={updateCategory}
                                                              key={row.mappedId}/>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    })}
                </div>
                {/*UNFILTERED ROWS (FOR DEBUGGING)*/}
                <p className={"pt-8"}>Unfiltered Rows</p>
                <table>
                    <thead>
                    <tr className="bg-gray-900">
                        <th className="p-2 border">Date</th>
                        <th className="p-2 border">Posting</th>
                        <th className="p-2 border">Amount</th>
                        <th className="p-2 border">From</th>
                        <th className="p-2 border">To</th>
                    </tr>
                    </thead>
                    <tbody>
                    {unfilteredRows
                        .filter((row) => !getCategory(row)) // only unassigned
                        .map((row, i) => {
                            const amount = row.mappedAmount;
                            return (
                                <React.Fragment key={i}>
                                    <tr className="even:bg-gray-950">
                                        <td className="p-2 border">{row.mappedDate}</td>
                                        <td className="p-2 border">{row.mappedText}</td>
                                        {amount > 0 &&
                                            <td className="p-2 border text-right bg-green-700">{amount.toFixed(2)}</td>}
                                        {amount < 0 && <td className="p-2 border text-right">{amount.toFixed(2)}</td>}
                                        <td className="p-2 border">{row.mappedFrom}</td>
                                        <td className="p-2 border">{row.mappedTo}</td>
                                    </tr>

                                    <tr className="even:bg-gray-950">
                                        <td colSpan={5} className={""}>
                                            <div className={"grid grid-cols-2 gap-1"}>
                                                {Object.keys(row).filter(e => !!e.length).map(e => {
                                                    return <p key={i + e} className={"text-xs"}>{e}: {row[e]}</p>
                                                })}
                                            </div>
                                        </td>
                                    </tr>
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Right Panel: Aggregates */}
            <div className="w-1/2 p-4 overflow-y-auto">

                <p className={"text-2xl font-bold"}>Categories</p>
                <div className={"flex flex-col gap-8"}>
                    {Object.keys(groupedByCategory).filter(e => !!e).toSorted((a, b) => a.localeCompare(b)).map(cat => {
                        const rows = groupedByCategory[cat]
                        if (!rows) {
                            return null;
                        }
                        return <div key={cat}>
                            <p className={"text-xl"}>{cat}</p>
                            <table className="text-sm w-full border">
                                <thead>
                                <tr className="bg-gray-900">
                                    <th className="p-2 border text-left">Posting Text</th>
                                    <th className="p-2 border text-right">Date</th>
                                    <th className="p-2 border text-right">Amount</th>
                                    <th className="p-2 border text-right">Posting</th>
                                </tr>
                                </thead>
                                <tbody>
                                {rows.map((row, idx) => {
                                    const category = getCategory(row);
                                    return <tr key={idx}>
                                        <td>{row.mappedPosting}</td>
                                        <td>{row.mappedDate}</td>
                                        <td>{row.mappedAmount}</td>
                                        <td>
                                            <select
                                                className="w-full p-1 border"
                                                onClick={(e) => e.stopPropagation()}
                                                value={category}
                                                onChange={(e) => setCategory(row, e.target.value)}>
                                                <option value="" className={"bg-gray-900"}>Unassigned</option>
                                                {categories.map((opt) => (
                                                    <option className={"bg-gray-900"} key={opt} value={opt}>
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                })}
                                </tbody>
                            </table>
                        </div>
                    })}
                </div>

                <div className={"flex my-6 mt-8 flex-row flex-grow border-solid border-b-2"}/>

                <h2 className="text-lg font-bold mb-4">Category Totals</h2>
                <table className="text-sm w-full border">
                    <thead>
                    <tr className="bg-gray-900">
                        <th className="p-2 border text-left">Category</th>
                        <th className="p-2 border text-right">Total</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedAggregates.map(([cat, sum]) => (
                        <tr key={cat} className="even:bg-gray-950">
                            <td className="p-2 border">{cat}</td>
                            <td className="p-2 border text-right">{sum.toFixed(2)} DKK</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {sortedAggregates.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">No rows categorized yet.</p>
                )}
            </div>
        </div>
    );
}

interface PostingsTableRowProps {
    row: MappedCSVRow;
    category: string | undefined;
    categories: string[];
    onSelectCategory: (selectedRow: MappedCSVRow, category: string) => void;
}

const PostingsTableRow = ({row, category, categories, onSelectCategory}: PostingsTableRowProps) => {
    const [isExpanded, setExpanded] = useState(false)
    const amount = row.mappedAmount

    const toggleOpen = () => {
        setExpanded(!isExpanded);
    }
    if (category) {
        console.error(row)
    }

    return <>
        <tr className="even:bg-gray-950" onClick={toggleOpen}>
            <td className="p-2 border">{row.mappedDate}</td>
            <td className="p-2 border">{row.mappedText}</td>
            {amount > 0 &&
                <td className="p-2 border text-right bg-green-700">{amount.toFixed(2)}</td>}
            {amount < 0 && <td className="p-2 border text-right">{amount.toFixed(2)}</td>}
            <td className="p-2 border">
                <select
                    className="w-full p-1 border"
                    onClick={(e) => e.stopPropagation()}
                    value={category}
                    onChange={(e) => onSelectCategory(row, e.target.value)}>
                    <option value="" className={"bg-gray-900"}>Unassigned</option>
                    {categories.map((opt) => (
                        <option className={"bg-gray-900"} key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
            </td>
        </tr>
        {isExpanded && <tr className="even:bg-gray-950">
            <td colSpan={5} className={""}>
                <div className={"grid grid-cols-2 gap-1"}>
                    {Object.keys(row).filter(e => !!e.length).map(e => {
                        return <p key={e} className={"text-xs"}>{e}: {row[e]}</p>
                    })}
                </div>
            </td>
        </tr>}
    </>
}