import {MappedCSVRow, Envelope, Transaction, TransactionID, AccountNumber} from "@/model";
import {getAdvancedFiltersData} from "@/data";
import dayjs, {Dayjs} from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat)

export const formatCurrency = (amount: number) =>
    amount.toLocaleString("da-DK", {
        style: "currency",
        currency: "DKK",
        minimumFractionDigits: 2,
    });

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

export const getSum = (rows: Transaction[]) => {
    return rows.reduce((pre, cur) => pre + cur.amount, 0)
}

export const transactionsSortedByDate = (a: Transaction, b: Transaction) => {
    const aDate = a.date;
    const bDate = b.date;
    return bDate.unix() - aDate.unix();
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

export const formatDayjs = (date: dayjs.Dayjs) => {
    return date.format("DD-MM-YYYY");
}

export const formatMonth = (date:Date) => {
    return dayjs(date).format("MMMM YYYY")
}

export const formatDate = (date: Date) => {
    return dayjs(date).format("MMM D")
}

export const getEnvelopeFromDateString = (datestr: string): Envelope => {
    return getDayJs(datestr).format("MM-YYYY")
}

export const getEnvelopeFromDate = (date: Dayjs): Envelope => {
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

export const predictIsCsvRowTransfer = (row: MappedCSVRow, isAccountOwned: (id: AccountNumber) => boolean): boolean => {
    if (!row.mappedFrom || !row.mappedTo) {
        return false;
    }
    if (row.mappedFrom === row.mappedTo) {
        return false; // Same account, not a transfer
    }
    return isAccountOwned(row.mappedFrom) && isAccountOwned(row.mappedTo);
}