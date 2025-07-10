import React from "react";
import SingleLineChart from "@/components/SingleLineChart";
import { formatCurrency } from "@/utility/datautils";

interface IncomeChartProps {
    averageIncome: number;
    chartData: { value: number; date: number }[];
}

const IncomeChart: React.FC<IncomeChartProps> = ({ averageIncome, chartData }) => {
    // Sort chartData by date to ensure correct order regardless of input
    const sortedChartData = [...chartData].sort((a, b) => a.date - b.date);
    return (
        <div>
            <p>Average Income: {formatCurrency(averageIncome)}</p>
            <div className="w-full h-80">
                <SingleLineChart
                    lineName={"Income"}
                    zeroLineName={"Average"}
                    data={sortedChartData}
                    zero={parseFloat(averageIncome.toFixed(0))}
                    autoScaleY
                />
            </div>
        </div>
    );
};

export default IncomeChart;
