import React, {createElement, use, useMemo} from 'react';
import {InsightsContext} from "@/features/insight/InsightPage";
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {getCategoryColorForName} from '@/utility/categoryColors';
import useFormatCurrency from "@/hooks/FormatCurrency";
import {formatEnvelope} from "@/utility/datautils";

const EnvelopeExpensesByCategory = () => {
    const {transactionsByEnvelope, categoriesSortedByMonthlyCost, selectedCategories} = use(InsightsContext);

    // Use the master sorted list filtered by selectedCategories for consistent color assignment
    const filteredCategories = useMemo(() =>
            categoriesSortedByMonthlyCost.filter(cat => selectedCategories.includes(cat)),
        [categoriesSortedByMonthlyCost, selectedCategories]
    );

    // Prepare data for recharts: [{ envelope: '2024-01', Category1: 123, Category2: 456, ... }, ...]
    const data = useMemo(() => {
        return Object.entries(transactionsByEnvelope || {})
            .map(([envelope, txs]) => {
                const row: EnvelopeExpensesRow = {
                    envelope: formatEnvelope ? formatEnvelope(envelope) : envelope
                };
                filteredCategories.forEach(cat => {
                    row[cat] = (txs || [])
                        .filter(t => t.type === 'expense' && t.category === cat)
                        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
                });
                return row;
            })
            .sort((a, b) => (a.envelope as string).localeCompare(b.envelope as string));
    }, [transactionsByEnvelope, filteredCategories]);

    return (
        <div className="flex flex-col flex-grow h-full"> {/* Use flex layout and h-full for responsive height */}
            <h2 className="text-md font-semibold text-white">Monthly Expenses by Category</h2>
            <div className="flex-1"> {/* Chart fills remaining space */}
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barCategoryGap={8} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444"/>
                        <XAxis dataKey="envelope" stroke="#ccc"/>
                        <YAxis stroke="#ccc"/>
                        <Tooltip content={CustomTooltip}/>
                        <Legend wrapperStyle={{color: '#e5e7eb'}}/>
                        {filteredCategories.map((cat) => (
                            <Bar key={cat} dataKey={cat}
                                 fill={getCategoryColorForName(cat, categoriesSortedByMonthlyCost)}
                                 radius={[6, 6, 0, 0]}
                                 shape={<CustomBar/>}/>
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// Use a proper type for the tooltip payload entries
interface TooltipEntry {
    color: string;
    name: string;
    value: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipEntry[];
    label?: string;
}

// Use correct types for recharts v3 Tooltip content
import { TooltipContentProps } from 'recharts';

const CustomTooltip = (props: TooltipContentProps<number, string>) => {
    const formatCurrency = useFormatCurrency();
    const {active, payload, label} = props;
    if (active && payload && payload.length) {
        // Sort payload descending by value for the current envelope
        const sortedPayload = [...payload].sort((a, b) => ((b.value ?? 0) - (a.value ?? 0)));
        return (
            <div className="bg-gray-800 text-gray-100 rounded-lg shadow-lg px-4 py-2 border border-gray-700">
                <div className="font-semibold mb-1">{String(label)}</div>
                <div className="flex flex-col gap-1">
                    {sortedPayload.map((entry, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-full" style={{backgroundColor: entry.color}}></span>
                            <span className="text-sm">{entry.name}: {formatCurrency(entry.value as number)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

interface EnvelopeExpensesRow {
    envelope: string;
    [category: string]: number | string;
}

interface CustomBarProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fill?: string;
    radius?: number | [number, number, number, number];
    className?: string;
    style?: React.CSSProperties;
}

const CustomBar = (props: CustomBarProps) => {
    const {x, y, width, height, fill, radius, className, style} = props;
    return createElement('rect', {
        x, y, width, height, fill, rx: Array.isArray(radius) ? radius[0] : radius, className, style
    });
};


export default EnvelopeExpensesByCategory;
