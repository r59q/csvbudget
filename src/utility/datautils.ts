import {MappedCSVRow, Envelope} from "@/model";
import {getAdvancedFiltersData} from "@/data";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat)

export const formatCurrency = (amount: number) =>
    amount.toLocaleString("da-DK", {
        style: "currency",
        currency: "DKK",
        minimumFractionDigits: 2,
    });

export const advancedFilters = (row: MappedCSVRow) => {
    const parsedFilters: string[] = getAdvancedFiltersData().load();
    if (parsedFilters.length === 0) return true;
    const amount = row.mappedAmount;
    const to = row.mappedTo;
    const from = row.mappedFrom;
    const date = row.mappedDate;
    const posting = row.mappedText;
    try {
        const filterEvals = parsedFilters.map(filter => Boolean(eval(filter)));
        return !filterEvals.includes(true);
    } catch (e) {
        alert(`Filter evaluations failed. Got\n ${e}\n\nRemoved all filters to avoid softlock, sorry. Please refresh the page`)
        getAdvancedFiltersData().save([]);
    }
    return false;
}

export const groupByMonth = (rows: MappedCSVRow[]): Partial<Record<Envelope, MappedCSVRow[]>> => {
    return Object.groupBy(rows, row => {
        return dayjs(row.mappedDate, 'DD-MM-YYYY').format("MMMM YYYY");
    });
}

export const getSum = (rows: MappedCSVRow[]) => {
    return rows.reduce((pre, cur) => pre + cur.mappedAmount, 0)
}

export const sortedByDate = (a: MappedCSVRow, b: MappedCSVRow) => {
    const aDate = dayjs(a.mappedDate, 'DD-MM-YYYY');
    const bDate = dayjs(b.mappedDate, 'DD-MM-YYYY');
    return bDate.unix() - aDate.unix()
}

export const intersection = <T,>(arr1: T[], arr2: T[]) => {
    return Array.from(new Set(arr1.filter(value => arr2.includes(value))));
}

export const getDayJs = (date: string) => {
    return dayjs(date, 'DD-MM-YYYY');
}

export const formatMonth = (date:Date) => {
    return dayjs(date).format("MMMM YYYY")
}

export const formatDate = (date: Date) => {
    return dayjs(date).format("MMM D")
}

export const getEnvelope = (datestr: string): Envelope => {
    return getDayJs(datestr).format("MM-YYYY")
}