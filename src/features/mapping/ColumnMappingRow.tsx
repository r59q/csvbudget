import React from "react";
import {useGlobalContext} from "@/context/GlobalContext";
import { currencyOptions } from "@/utility/currencyOptions";

interface ColumnMappingRowProps {
    field: string;
    value: string;
    headers: string[];
    onChange: (field: string, value: string) => void;
}

interface CurrencySelectorProps {
    currency: string;
    setCurrency: (currency: string) => void;
}

const CurrencySelector = ({currency, setCurrency}: CurrencySelectorProps) => (
    <select
        className="w-28 p-1 border bg-gray-900 text-white"
        value={currency}
        onChange={e => setCurrency(e.target.value)}
        size={1}
    >
        {currencyOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
    </select>
);

const ColumnMappingRow = ({field, value, headers, onChange}: ColumnMappingRowProps) => {
    const {currency, setCurrency} = useGlobalContext();
    return (
        <tr>
            <td className="p-2 border font-semibold capitalize">{field}</td>
            <td className="p-2 border">
                <div className={field === "amount" ? "flex gap-2" : undefined}>
                    <select
                        className="w-full p-1 border"
                        value={value}
                        onChange={e => onChange(field, e.target.value)}
                    >
                        <option value="" className="bg-gray-900">Select column</option>
                        {headers.map(header => (
                            <option className="bg-gray-950" key={header} value={header}>
                                {header}
                            </option>
                        ))}
                    </select>
                    {field === "amount" && (
                        <CurrencySelector currency={currency} setCurrency={setCurrency}/>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default ColumnMappingRow;
