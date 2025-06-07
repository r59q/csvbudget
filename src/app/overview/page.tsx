'use client';
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {advancedFilters, loadCsvs, MappedCsvRow} from '@/utility/csvutils';
import React, {useEffect, useState} from 'react';

type RowCategoryMap = Record<string, string>; // key: JSON.stringify(row)

dayjs.extend(customParseFormat)

export default function GroupingPage() {
    const [rows, setRows] = useState<MappedCsvRow[]>([]);
    const [rowMap, setRowMap] = useState<RowCategoryMap>({});
    const [categories, setCategories] = useState<string[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [ownAccounts, setOwnAccounts] = useState<string[]>([])

    useEffect(() => {
        const loaded = loadCsvs();
        setRows(loaded);
        setOwnAccounts(JSON.parse(localStorage.getItem("own_accounts") ?? "[]"))

        const savedMap = localStorage.getItem('row_category_map');
        if (savedMap) setRowMap(JSON.parse(savedMap));

        const savedCats = localStorage.getItem('categories');
        if (savedCats) setCategories(JSON.parse(savedCats));
    }, []);

    const saveMap = (map: RowCategoryMap) => {
        setRowMap(map);
        localStorage.setItem('row_category_map', JSON.stringify(map));
    };

    const saveCategories = (cats: string[]) => {
        const sorted = [...new Set(cats)].sort();
        setCategories(sorted);
        localStorage.setItem('categories', JSON.stringify(sorted));
    };

    const updateCategory = (selectedRow: MappedCsvRow, category: string) => {
        const posting = selectedRow.mappedPosting;
        const updatedMap: RowCategoryMap = {...rowMap};

        rows.forEach((row) => {
            if (row.mappedPosting === posting) {
                const key = JSON.stringify(row);
                updatedMap[key] = category;
            }
        });

        saveMap(updatedMap);

        // Also add to categories if it's new
        if (category && !categories.includes(category)) {
            saveCategories([...categories, category]);
        }
    };

    const updateSingleCategory= (row: MappedCsvRow, category:string) => {
        const updatedMap: RowCategoryMap = {...rowMap};
        const key = JSON.stringify(row);
        updatedMap[key] = category;
        saveMap(updatedMap);
    }

    const addNewCategory = () => {
        const trimmed = newCategory.trim();
        if (trimmed && !categories.includes(trimmed)) {
            saveCategories([...categories, trimmed]);
            setNewCategory('');
        }
    };

    const getCategory = (row: MappedCsvRow) => {
        const category = rowMap[JSON.stringify(row)] || '';
        return category;
    }

    const aggregation: Record<string, number> = {};
    rows.forEach((row) => {
        const cat = getCategory(row);
        if (!cat) return;
        const amt = parseFloat(row.mappedAmount.replace('.', '').replace(',', '.') || '0');
        aggregation[cat] = (aggregation[cat] || 0) + amt;
    });

    const deleteCategory = (catToRemove: string) => {
        // Remove from category list
        const updatedCategories = categories.filter((cat) => cat !== catToRemove);
        saveCategories(updatedCategories);

        // Remove all mappings to this category
        const updatedMap = Object.fromEntries(
            Object.entries(rowMap).filter(([_, value]) => value !== catToRemove)
        );
        saveMap(updatedMap);
    };

    const sortedAggregates = Object.entries(aggregation).sort((a, b) => b[1] - a[1]);

    const filteredRows: MappedCsvRow[] = rows.filter(e => {
        return !(ownAccounts.includes(e.mappedFrom) && ownAccounts.includes(e.mappedTo));
    }).filter(advancedFilters).toSorted((a, b) => {
        const aDate = dayjs(a.mappedDate, 'DD-MM-YYYY');
        const bDate = dayjs(b.mappedDate, 'DD-MM-YYYY');
        return bDate.unix() - aDate.unix()
    });

    const filteredRowsDiff = rows.length - filteredRows.length;
    const unfilteredRows = rows.filter((e => {
        return (!ownAccounts.includes(e.mappedFrom) || ownAccounts.includes(e.mappedTo)) || !advancedFilters(e)
    }))
    console.assert(unfilteredRows.length === filteredRowsDiff)

    const groupedFilteredRows = Object.groupBy(filteredRows, row => {
        return dayjs(row.mappedDate, 'DD-MM-YYYY').format("MMMM YYYY");
    });

    const groupedByCategory = Object.groupBy(filteredRows, row => {
        return getCategory(row);
    })

    return (
        <div className="flex min-h-screen">
            {/* Left Panel */}
            <div className="w-2/3 p-4 border-r overflow-y-auto">
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
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
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
                    {Object.keys(groupedFilteredRows).map(grouping => {
                        const rows = groupedFilteredRows[grouping];
                        if (!rows) return null;
                        return <div key={grouping}>
                            <p key={grouping} className={"text-2xl"}>{grouping}</p>
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
                                    .filter((row) => !getCategory(row) || getCategory(row) === "") // only unassigned
                                    .map((row, i) => {
                                        const category = getCategory(row);
                                        return (
                                            <PostingsTableRow {...{category, categories, row}}
                                                              onSelectCategory={updateCategory}
                                                              key={i}/>
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
                            const amount = parseFloat(row.mappedAmount);
                            return (
                                <React.Fragment key={i}>
                                    <tr className="even:bg-gray-950">
                                        <td className="p-2 border">{row.mappedDate}</td>
                                        <td className="p-2 border">{row.mappedPosting}</td>
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
            <div className="w-1/3 p-4 overflow-y-auto">
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
                {Object.keys(groupedByCategory).filter(e=>!!e).toSorted((a,b) => a.localeCompare(b)).map(cat => {
                    const rows = groupedByCategory[cat]
                    if (!rows) {
                        return null;
                    }
                    return <div key={cat}>
                        <p>{cat}</p>
                        <table className="text-sm w-full border">
                        <thead>
                        <tr className="bg-gray-900">
                            <th className="p-2 border text-left">Posting Text</th>
                            <th className="p-2 border text-right">Amount</th>
                            <th className="p-2 border text-right">Posting</th>
                        </tr>
                        </thead>
                            <tbody>
                            {rows.map((row,idx) => {
                            const category = getCategory(row);
                            return <tr key={idx}>
                                <td>{row.mappedPosting}</td>
                                <td>{row.mappedAmount}</td>
                                <td>
                                    <select
                                        className="w-full p-1 border"
                                        onClick={(e) => e.stopPropagation()}
                                        value={category}
                                        onChange={(e) => updateSingleCategory(row, e.target.value)}>
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
        </div>
    );
}

interface PostingsTableRowProps {
    row: MappedCsvRow;
    category: string;
    categories: string[];
    onSelectCategory: (selectedRow: MappedCsvRow, category: string) => void;
}

const PostingsTableRow = ({row, category, categories, onSelectCategory}: PostingsTableRowProps) => {
    const [isExpanded, setExpanded] = useState(false)
    const amount = parseFloat(row.mappedAmount);

    const toggleOpen = () => {
        setExpanded(!isExpanded);
    }

    return <>
        <tr className="even:bg-gray-950" onClick={toggleOpen}>
            <td className="p-2 border">{row.mappedDate}</td>
            <td className="p-2 border">{row.mappedPosting}</td>
            {amount > 0 &&
                <td className="p-2 border text-right bg-green-700">{amount.toFixed(2)}</td>}
            {amount < 0 && <td className="p-2 border text-right">{amount.toFixed(2)}</td>}
            <td className="p-2 border">
                <select
                    className="w-full p-1 border"
                    onClick={(e) => e.stopPropagation()}
                    value={category}
                    onChange={(e) => onSelectCategory(row, e.target.value)}
                >
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