"use client";
import {useEffect, useState} from "react";
import {loadCsvs} from "@/utility/csvutils";

export default function BudgetDataViewer() {
    const [rows, setRows] = useState<Record<string, string>[]>([]);

    useEffect(() => {
        const uniqueData = loadCsvs();
        setRows(uniqueData);
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">Unique Budget Entries ({rows.length})</h2>
            <pre className="text-xs p-2 rounded overflow-x-auto">
                {JSON.stringify(rows, null, 2)}
            </pre>
        </div>
    );
}