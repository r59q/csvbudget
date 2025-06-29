import { useMemo } from "react";
import { MappedCSVRow } from "@/model";

export default function useCategoryPredictionIndex(categoryMap: Record<string, string>, mappedCSVRows: MappedCSVRow[], getCategory: (id: number) => string) {
    return useMemo(() => {
        const index: Record<string, string> = {};
        Object.keys(categoryMap).forEach(tranId => {
            const csvRow = mappedCSVRows.find(row => row.mappedId === parseInt(tranId));
            if (csvRow) {
                const category = getCategory(parseInt(tranId));
                if (category !== "Unassigned") {
                    index[csvRow.mappedText] = category;
                }
            }
        })
        return index;
    }, [categoryMap, mappedCSVRows, getCategory]);
}

