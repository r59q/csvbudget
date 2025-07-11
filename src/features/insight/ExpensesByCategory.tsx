import React, {use, useMemo} from 'react';
import {InsightsContext} from "@/features/insight/InsightPage";
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell} from 'recharts';
import {formatCurrency} from '@/utility/datautils';

const CATEGORY_COLORS = [
    '#7dd3fc', '#f9a8d4', '#a7f3d0', '#fcd34d', '#c4b5fd', '#fdba74', '#fca5a5', '#6ee7b7', '#fef08a', '#a5b4fc',
    '#fbbf24', '#f472b6', '#34d399', '#818cf8', '#f87171', '#38bdf8', '#facc15', '#a3e635', '#fb7185', '#fca5a5',
];
const getCategoryColor = (idx: number) => CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

const CustomTooltip = ({active, payload, label}: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800 text-gray-100 rounded-lg shadow-lg px-4 py-2 border border-gray-700">
                <div className="font-semibold mb-1">{label}</div>
                <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full" style={{backgroundColor: payload[0].color}}></span>
                    <span className="text-sm">{formatCurrency(payload[0].value)}</span>
                </div>
            </div>
        );
    }
    return null;
};

const ExpensesByCategory = () => {
    const {categoriesSortedByMonthlyCost, averages} = use(InsightsContext);
    // Prepare data for recharts: [{ category: string, average: number }]
    const data = useMemo(() =>
        categoriesSortedByMonthlyCost.map((cat) => ({
            category: cat,
            average: averages.averageExpenseByCategoryPerEnvelope[cat] || 0,
        })), [categoriesSortedByMonthlyCost, averages]);

    return (
        <div className="w-full h-full">
            <h2 className="text-md font-semibold text-white">Average Monthly Expenses by Category</h2>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{top: 8, right: 4}}
                    barCategoryGap={5}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis type="number" stroke="#ccc" tickFormatter={formatCurrency} orientation="bottom" reversed />
                    <YAxis
                        type="category"
                        dataKey="category"
                        stroke="#ccc"
                        width={120}
                        interval={0}
                        tick={{
                            fill: '#ccc',
                            fontSize: 12,
                            textAnchor: 'end',
                        }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#222', opacity: 0.1}} />
                    <Bar dataKey="average"
                        isAnimationActive={false}
                        radius={[6, 6, 6, 6]}
                    >
                        {data.map((entry, idx) => (
                            <Cell key={entry.category} fill={getCategoryColor(idx)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ExpensesByCategory;