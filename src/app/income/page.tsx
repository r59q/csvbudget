"use client";

import useCSVRows from "@/hooks/CSVRows";
import useOwnedAccounts from "@/hooks/OwnedAccount";
import useIncome from "@/hooks/Income";
import {formatCurrency, groupByMonth, sortedByDate} from "@/utility/datautils";

const Page = () => {
    const {mappedCSVRows} = useCSVRows()
    const {filterInterAccountTransaction} = useOwnedAccounts();
    const {getMonthForIncome, setMonthForIncome, incomeRows, incomeMap} = useIncome();

    const unfilteredRows = mappedCSVRows.filter(e => filterInterAccountTransaction(e)).filter(row => row.mappedAmount > 0).sort(sortedByDate);

    const unfilteredRowsGroupedByMonth = groupByMonth(unfilteredRows);

    const months = Object.keys(unfilteredRowsGroupedByMonth);

    const monthlyIncomeRows = Object.groupBy(incomeRows, row => incomeMap[row.mappedId]);
    const incomeMonths = Object.keys(monthlyIncomeRows);
    const averageIncome = incomeMonths.map(month => {
        const incomeRows = monthlyIncomeRows[month] ?? [];
        return incomeRows.map(row => row.mappedAmount).reduce((pre, cur) => pre + cur, 0);
    }).reduce((pre, cur) => pre + cur, 0) / incomeMonths.length

    return (
        <div className={"p-2"}>
            <div>
                <p>Average Income: {formatCurrency(averageIncome)}</p>
                {months.map(month => {
                    const rows = monthlyIncomeRows[month];
                    if (!rows) return null;
                    return <div key={month}>
                        <p>{month}</p>
                        {rows.map(row => <span
                            key={row.mappedId}>
                        {formatCurrency(row.mappedAmount)}
                    </span>)}
                    </div>;
                })}
            </div>

            {months.map(month => {
                const rows = unfilteredRowsGroupedByMonth[month];
                if (!rows) return null;
                return <div className={"flex flex-col gap-2 mt-4"} key={month}>
                    <p className={"text-2xl"}>{month}</p>
                    <table>
                        <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-2 border-b border-gray-700">Date</th>
                            <th className="px-4 py-2 border-b border-gray-700">Posting</th>
                            <th className="px-4 py-2 border-b border-gray-700 text-right">Amount</th>
                            <th className="px-4 py-2 border-b border-gray-700">Assigned Month</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((row) => {
                            const assignedMonth = getMonthForIncome(row);
                            return (
                                <tr key={row.mappedId}
                                    className="hover:bg-gray-800 transition-colors duration-150">
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
                                            onChange={(e) => setMonthForIncome(row, e.target.value)}>
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
            })}

        </div>
    );
};

export default Page;