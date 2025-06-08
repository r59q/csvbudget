"use client";
import React, {createContext, use, useEffect, useMemo, useRef, useState} from 'react';
import {advancedFilters, loadCsvs, MappedCsvRow} from "@/utility/csvutils";
import {formatCurrency, RowCategoryMap, saveCategories} from "@/utility/datautils";
import dayjs from "dayjs";

interface InsightsContextType {
    getCategory: (row: MappedCsvRow) => string;
}

interface MonthlyTotals {
    categoryTotals: Record<string, Record<string, number>>;
    totals: Record<string, number>;
}

const InsightsContext = createContext<InsightsContextType>(null!)

const InsightPage = () => {
    const [csvRows, setCsvRows] = useState<MappedCsvRow[]>([]);
    const [rowMap, setRowMap] = useState<RowCategoryMap>({});
    const [categories, setCategories] = useState<string[]>([]);
    const [ownAccounts, setOwnAccounts] = useState<string[]>([])

    const newCategoryInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        const loaded = loadCsvs();
        setCsvRows(loaded);
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

    const addNewCategory = () => {
        const current = newCategoryInputRef.current;
        if (!current) return;
        const trimmed = current.value.trim();
        if (trimmed && !categories.includes(trimmed)) {
            const cats = [...categories, trimmed];
            setCategories(saveCategories(cats));
            current.value = '';
        }
    };

    const getCategory = (row: MappedCsvRow) => rowMap[row.mappedId] || '';


    const aggregation: Record<string, number> = {};
    csvRows.forEach((row) => {
        const cat = getCategory(row);
        if (!cat) return;
        const amt = parseFloat(row.mappedAmount.replace('.', '').replace(',', '.') || '0');
        aggregation[cat] = (aggregation[cat] || 0) + amt;
    });


    const filteredRows: MappedCsvRow[] = useMemo(() => csvRows.filter(e => {
        return !(ownAccounts.includes(e.mappedFrom) && ownAccounts.includes(e.mappedTo));
    }).filter(advancedFilters).toSorted((a, b) => {
        const aDate = dayjs(a.mappedDate, 'DD-MM-YYYY');
        const bDate = dayjs(b.mappedDate, 'DD-MM-YYYY');
        return bDate.unix() - aDate.unix()
    }), [csvRows])

    const groupedByMonth: Record<string, MappedCsvRow[] | undefined> = useMemo(() => Object.groupBy(filteredRows, row => {
        return dayjs(row.mappedDate, 'DD-MM-YYYY').format("MMMM YYYY");
    }), [filteredRows]);
    const months = Object.keys(groupedByMonth).filter(e => e !== "");

    const monthlyTotals: MonthlyTotals = useMemo(() => {
        return computeMonthlyTotals(months, groupedByMonth, getCategory);
    }, [csvRows])


    const total = useMemo(() => months.reduce((pre, cur) => {
        return monthlyTotals.totals[cur] + pre;
    }, 0), [monthlyTotals])

    if (filteredRows.length === 0) {
        return <></>
    }

    const latestDate = dayjs(filteredRows[0].mappedDate, 'DD-MM-YYYY');
    const earliestDate = dayjs(filteredRows[filteredRows.length - 1].mappedDate, 'DD-MM-YYYY');
    const durationDays = latestDate.diff(earliestDate, 'days');
    const dailyAverageExpenses = total / durationDays;
    const monthlyAverageExpenses = total / months.length;
    const monthlyAverageExpensesPerCategory: Record<string, number> = {};
    categories.forEach(category => {
        const monthly = months.map(month => {
            return monthlyTotals.categoryTotals[month][category];
        });
        const total = monthly.reduce((pre, cur) => {
            if (isNaN(cur)) return pre;
            return pre + cur
        }, 0);
        monthlyAverageExpensesPerCategory[category] = total / months.length;
    })

    return (
        <InsightsContext.Provider value={{getCategory}}>
            <div className={"p-2 flex flex-col gap-8 pt-4"}>
                <div className={"flex flex-row"}>
                    <div>
                        <p>Statistics</p>
                        <div className={"grid gap-2 grid-cols-2"}>
                            <p>Daily expenses</p>
                            <p>{formatCurrency(dailyAverageExpenses)}</p>
                            <p>Monthly expenses</p>
                            <p>{formatCurrency(monthlyAverageExpenses)}</p>
                            <p>Category</p>
                            <p className={"text-right"}>Monthly Average</p>
                            {categories.map(category => {
                                const categoryAverage = monthlyAverageExpensesPerCategory[category];
                                return <React.Fragment key={category}>
                                    <p>{category}</p>
                                    <p className={"text-right"}>{formatCurrency(categoryAverage)}</p>
                                </React.Fragment>
                            })}
                        </div>
                    </div>
                </div>
                <div>
                    {months.map(month => {
                        const rows = groupedByMonth[month];
                        if (!rows) return null;
                        return <div key={month}>
                            <p>{month}</p>
                            <MonthInsight {...{month, rows}}
                                          categoryTotals={monthlyTotals.categoryTotals[month]}
                                          totalSum={monthlyTotals.totals[month]}/>
                        </div>
                    })}
                </div>
            </div>
        </InsightsContext.Provider>
    );
};

interface MonthInsightProps {
    month: string,
    rows: MappedCsvRow[],
    categoryTotals: Record<string, number>;
    totalSum: number;
}

const MonthInsight = ({month, rows, categoryTotals, totalSum}: MonthInsightProps) => {
    return <MonthInsightsTable {...{month, rows, categoryTotals, totalSum}}/>
};

const MonthInsightsTable = ({
                                rows,
                                totalSum,
                                categoryTotals
                            }: Pick<MonthInsightProps, 'month' | "rows" | 'totalSum' | 'categoryTotals'>) => {
    const {getCategory} = use(InsightsContext);
    const [open, setOpen] = useState(false);

    return (
        <div className="rounded-xl shadow p-4 mb-6 bg-gray-800">
            <button
                className="flex items-center justify-between w-full text-left text-lg font-semibold text-gray-300 hover:text-white"
                onClick={() => setOpen(!open)}>
                <span className={"text-sm"}>Transactions</span>
                <span className="text-sm">{open ? "▼" : "►"}</span>
            </button>

            {open && (
                <div className="mt-4 transition-all duration-300">
                    <div className="overflow-x-auto mb-4">
                        <table className="w-full text-sm text-left text-gray-300 border border-gray-700 rounded-lg">
                            <thead className="bg-gray-900 text-gray-500 font-semibold">
                            <tr>
                                <th className="px-4 py-2 border-b">Date</th>
                                <th className="px-4 py-2 border-b">Posting</th>
                                <th className="px-4 py-2 border-b">Category</th>
                                <th className="px-4 py-2 border-b text-right">Amount</th>
                            </tr>
                            </thead>
                            <tbody>
                            {rows.map((row) => {
                                const category = getCategory(row);
                                return <MonthInsightsTableRow {...{row, category}} key={row.mappedId}/>
                            })}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-gray-600 pt-2">
                        <MonthInsightsTableTotals {...{categoryTotals, totalSum}}/>
                    </div>
                </div>
            )}
        </div>
    );
}

interface MonthInsightsTableRowProps {
    row: MappedCsvRow;
    category: string;
}

const MonthInsightsTableRow = ({row, category}: MonthInsightsTableRowProps) => {
    return (
        <tr key={row.mappedId} className="even:bg-gray-700 hover:bg-gray-900">
            <td className="px-4 py-2 border-b">{row.mappedDate}</td>
            <td className="px-4 py-2 border-b">{row.mappedPosting}</td>
            <td className="px-4 py-2 border-b">
                {category || (
                    <span className="text-gray-500">Unassigned</span>
                )}
            </td>
            <td className="px-4 py-2 border-b text-right">
                {row.mappedAmount}
            </td>
        </tr>
    );
};

interface MonthInsightsTableTotalsProps {
    categoryTotals: Record<string, number>;
    totalSum: number;
}

const MonthInsightsTableTotals = ({
                                      categoryTotals,
                                      totalSum,
                                  }: MonthInsightsTableTotalsProps) => {
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const maxAbs = Math.max(...Object.values(categoryTotals).map(Math.abs), 1); // Avoid div/0

    return (
        <>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Category Totals</h3>
            <ul className="space-y-1 text-sm text-gray-300">
                {sorted.map(([category, total]) => (
                    <li
                        key={category}
                        className="flex justify-between border-b border-gray-700 pb-1"
                    >
                        <span>{category}</span>
                        <span style={{color: getHeatColor(total, maxAbs)}}>
              {formatCurrency(total)}
            </span>
                    </li>
                ))}
                <li className="flex justify-between font-semibold text-gray-200 pt-2 border-t border-gray-700 mt-2">
                    <span>Total</span>
                    <span>{formatCurrency(totalSum)}</span>
                </li>
            </ul>
        </>
    );
};

const getHeatColor = (value: number, maxAbs: number) => {
    const intensity = Math.min(Math.abs(value) / maxAbs, 1); // 0 - 1
    const red = Math.round(255 * intensity);
    const white = 255 - red;
    return `rgb(255, ${white}, ${white})`; // white to red gradient
};

const computeMonthlyTotals = (months: string[], groupedByMonth: Record<string, MappedCsvRow[] | undefined>, getCategory: (row: MappedCsvRow) => string): MonthlyTotals => {
    const totals: Record<string, number> = {};
    const monthlyCategoryTotals: Record<string, Record<string, number>> = {};

    months.forEach(month => {
        const rows = groupedByMonth[month];
        if (!rows) return;

        const categoryTotals: Record<string, number> = {};
        let totalSum = 0;

        rows.forEach((row) => {
            if (!categoryTotals) {
                throw new Error("wa")
            }
            const category = getCategory(row) || "Unassigned";
            const clean = row.mappedAmount.replace(",", ".").replace(/[^\d.-]/g, "");
            const num = parseFloat(clean);
            if (!isNaN(num)) {
                categoryTotals[category] = (categoryTotals[category] || 0) + num;
                totalSum += num;
            }
        });
        totals[month] = totalSum;
        monthlyCategoryTotals[month] = categoryTotals;
    })
    return {totals, categoryTotals: monthlyCategoryTotals};
};

export default InsightPage;
