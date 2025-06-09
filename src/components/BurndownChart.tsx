import {Area, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,} from "recharts";
import {formatDate} from "@/utility/datautils";

interface Props {
    burndown: { value: number, date: number }[]
}

export default function BurndownChart({burndown}: Props) {
    const augmentedBurndown = burndown.map(e => ({
        ...e,
        zero: 0
    }))
    return (
        <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={augmentedBurndown} margin={{top: 20, right: 30, left: 0, bottom: 5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444"/>
                    <XAxis dataKey="date" type={"number"} tickFormatter={(millis: number) => formatDate(new Date(millis))} domain={['dataMin', 'dataMax']} stroke="#ccc"/>
                    <YAxis domain={[0, 'dataMax']}
                           tickFormatter={(val, _) => val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                           stroke="#ccc"/>
                    <Tooltip formatter={e => e.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                             contentStyle={{backgroundColor: "#1f2937", border: "none"}}/>
                    <Legend/>
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#f87171"
                        strokeWidth={2}
                        dot={{r: 1}}
                        name="Remainder"
                    />
                    <Line
                        type="linear"
                        dataKey="zero"
                        stroke="#999999"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
