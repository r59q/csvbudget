import {AccountNumber, Envelope, MappedCSVRow, Transaction, TransactionID, TransactionType} from "@/model";
import {getAdvancedFiltersData} from "@/data";
import dayjs, {Dayjs} from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat)

export const advancedFilters = (row: Transaction) => {
    const parsedFilters: string[] = getAdvancedFiltersData().load();
    if (parsedFilters.length === 0) return true;
    const amount = row.amount;
    const to = row.to;
    const from = row.from;
    const date = row.date;
    const posting = row.text;
    try {
        const filterEvals = parsedFilters.map(filter => Boolean(eval(filter)));
        return !filterEvals.includes(true);
    } catch (e) {
        alert(`Filter evaluations failed. Got\n ${e}\n\nRemoved all filters to avoid softlock, sorry. Please refresh the page`)
        getAdvancedFiltersData().save([]);
    }
    return false;
}

export const groupByEnvelope = (rows: Transaction[]): Record<Envelope, Transaction[]> => {
    return Object.groupBy(rows, row => {
        return row.envelope;
    }) as Record<Envelope, Transaction[]>;
}

export const groupByDateMonth = (rows: Transaction[]): Record<string, Transaction[]> => {
    return Object.groupBy(rows, row => {
        return getEnvelopeFromDayjs(row.date);
    }) as Record<string, Transaction[]>;
}

export const getSumAfterRefund = (rows: Transaction[]) => {
    return rows.reduce((pre, cur) => pre + cur.amountAfterRefund, 0)
}

export const transactionsSortedByDate = (a: Transaction, b: Transaction) => {
    const aDate = a.date;
    const bDate = b.date;
    return bDate.unix() - aDate.unix();
}

export const intersection = <T, >(arr1: T[], arr2: T[]) => {
    return Array.from(new Set(arr1.filter(value => arr2.includes(value))));
}

export const getDayJs = (date: string, format: string) => {
    return dayjs(date, format);
}

export const detectDateFormat = (csvRows: MappedCSVRow[]): string => {
    const dateFormats = ["DD-MM-YYYY", "MM-DD-YYYY", "YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY/MM/DD"];
    const sampleDates = csvRows.map(row => row.mappedDate).slice(0, 10); // Take first 10 dates for detection

    for (const format of dateFormats) {
        if (sampleDates.every(date => dayjs(date, format, true).isValid())) {
            return format;
        }
    }
    return "DD-MM-YYYY"; // Default fallback
}

export const formatDayjsToDate = (date: dayjs.Dayjs) => {
    return date.format("MMM DD YYYY");
}
export const parseEnvelopeToDate = (envelope: Envelope): dayjs.Dayjs | undefined => {
    if (envelope === "Unassigned") {
        return undefined;
    }
    const [month, year] = envelope.split("-");
    return dayjs(`${year}-${month}-01`, "YYYY-MM-DD");
}
export const formatDayjsToMonth = (date: dayjs.Dayjs) => {
    return date.format("MMMM YYYY");
}

export const formatMonth = (date: Date) => {
    return dayjs(date).format("MMMM YYYY")
}

export const formatDate = (date: Date) => {
    return dayjs(date).format("MMM D")
}

export const getEnvelopeFromDayjs = (date: Dayjs): Envelope => {
    if (!date.isValid()) {
        return "Unassigned";
    }
    return date.format("MM-YYYY");
}

export const formatEnvelope = (envelope: Envelope): string => {
    if (envelope === "Unassigned") {
        return "Unassigned";
    }
    const [month, year] = envelope.split("-");
    return `${dayjs().month(Number(month) - 1).format("MMMM")} ${year}`;
}

export const predictEnvelope = (date: dayjs.Dayjs): Envelope => {
    if (!date.isValid()) {
        return "Unassigned";
    }
    // Check if the day is path the 25th of the month, if so, use next month
    if (date.date() > 25) {
        date = date.add(1, 'month');
    }
    return date.format("MM-YYYY");
}

export function predictTypeFromRows(row: MappedCSVRow, rows: MappedCSVRow[], getTypeFromId: (id: TransactionID) => TransactionType): TransactionType | undefined {
    for (const candidate of rows) {
        if (
            candidate.mappedText === row.mappedText &&
            Math.abs(candidate.mappedAmount - row.mappedAmount) <= Math.abs(row.mappedAmount) * 0.25
        ) {
            return getTypeFromId(candidate.mappedId);
        }
    }
    return undefined;
}

export const getExpenses = (txs: Transaction[]): Transaction[] => {
    return txs.filter(tx => tx.type === "expense" || tx.type === "transfer");
}

export const predictIsCsvRowTransfer = (row: MappedCSVRow, isAccountOwned: (id: AccountNumber) => boolean): boolean => {
    if (!row.mappedFrom || !row.mappedTo) {
        return false;
    }
    if (row.mappedFrom === row.mappedTo) {
        return false; // Same account, not a transfer
    }
    return isAccountOwned(row.mappedFrom) && isAccountOwned(row.mappedTo);
}

// Sort envelopes by date (format MM-YYYY)
export function compareEnvelopesByDate(a: string, b: string) {
    const [ma, ya] = a.split("-").map(Number);
    const [mb, yb] = b.split("-").map(Number);
    if (ya !== yb) return ya - yb;
    return ma - mb;
}
