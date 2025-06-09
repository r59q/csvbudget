import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {CsvRow} from "@/model";

dayjs.extend(customParseFormat)

export const MAPPED_COLUMNS = ['from', 'to', 'posting', 'amount', 'date'] as const;

export type ColumnMapping = Record<typeof MAPPED_COLUMNS[number], string>;

export const getSchemaKeyFromCsvRow = (csvRow: CsvRow) => {
    return Object.keys(csvRow).filter(e => !e.startsWith("mapped")).join("-")
}