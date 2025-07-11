import {CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,} from "recharts";
import {formatDate} from "@/utility/datautils";

interface Props {
    data: { value: number, date: number }[]
    zero: number;
    autoScaleY?: boolean;
    zeroLineName?: string;
    lineName?: string;
}

export default function SingleLineChart({
                                            data,
                                            zero,
                                            autoScaleY = false,
                                            zeroLineName = "Zero",
                                            lineName = "Remainder"
                                        }: Props) {
    const augmentedBurndown = data.map(e => ({
        ...e,
        zero: zero
    }));
    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={augmentedBurndown} margin={{top: 20, right: 30, left: 0, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444"/>
                <XAxis dataKey="date" type={"number"}
                       tickFormatter={(millis: number) => formatDate(new Date(millis))}
                       domain={['dataMin', 'dataMax']} stroke="#ccc"/>
                <YAxis domain={autoScaleY ? ['auto', 'auto'] : [0, 'dataMax']}
                       tickFormatter={(val, _) => val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                       stroke="#ccc"/>
                <Tooltip formatter={e => e.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                         labelFormatter={(millis: number) => formatDate(new Date(millis))}
                         contentStyle={{backgroundColor: "#1f2937", border: "none"}}/>
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f87171"
                    strokeWidth={2}
                    dot={{r: 1}}
                    name={lineName}
                />
                <Line
                    type="linear"
                    dataKey="zero"
                    stroke="#999999"
                    strokeWidth={2}
                    name={zeroLineName}
                    dot={false}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
}
