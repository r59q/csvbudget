import React, {createElement, use, useMemo} from 'react';
import {InsightsContext} from "@/features/insight/InsightPage";
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis} from 'recharts';
import {formatCurrency, formatEnvelope} from '@/utility/datautils';
import {NameType, ValueType} from 'recharts/types/component/DefaultTooltipContent';
import {getCategoryColorForName} from '@/utility/categoryColors';

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
                const row: Record<string, any> = {
                    envelope: formatEnvelope ? formatEnvelope(envelope) : envelope
                };
                filteredCategories.forEach(cat => {
                    row[cat] = (txs || [])
                        .filter(t => t.type === 'expense' && t.category === cat)
                        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
                });
                return row;
            })
            .sort((a, b) => a.envelope.localeCompare(b.envelope));
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
                        <Tooltip
                            content={<CustomTooltip categoriesSortedByMonthlyCost={categoriesSortedByMonthlyCost}/>}/>
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

// Custom dark tooltip for recharts
interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
    categoriesSortedByMonthlyCost: string[];
}

const CustomTooltip = (props: CustomTooltipProps) => {
    const {active, payload, label} = props;
    if (active && payload && payload.length) {
        // Sort payload descending by value for the current envelope
        const sortedPayload = [...payload]
            .filter(entry => typeof entry.value === 'number')
            .sort((a, b) => (b.value as number) - (a.value as number));
        return (
            <div className="bg-gray-800 text-gray-100 rounded-lg shadow-lg px-4 py-2 border border-gray-700">
                <div className="font-semibold mb-1">{label}</div>
                {sortedPayload.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-full"
                              style={{backgroundColor: entry.color}}></span>
                        <span className="text-sm">{entry.name}: <span
                            className="font-mono">{formatCurrency(entry.value as number)}</span></span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const CustomBar = (props: any) => {
    // Only pass valid rect props to the DOM
    const {x, y, width, height, fill, radius, className, style, ...rest} = props;
    return createElement('rect', {
        x, y, width, height, fill, rx: Array.isArray(radius) ? radius[0] : radius, className, style
        // Do not spread ...rest to avoid passing category names or other invalid props
    });
};


export default EnvelopeExpensesByCategory;
