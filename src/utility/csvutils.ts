import Papa, {ParseResult} from 'papaparse';
import {CsvRowId, saveAdvancedFilters} from "@/utility/datautils";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat)

type CsvRow = Record<string, string | number>; // one row of CSV as an object
export type CsvHeaders = string[]; // one row of CSV as an object
type CsvFile = { name: string; content: string };
type BlackList = { account: string, blacklisted: string }[]

// IMPORTANT: The mapped csv row, must have an equivalent entry in the column mapping where mapped is removed and first letter is lower case
export interface MappedCsvRow extends CsvRow {
        mappedId: CsvRowId; // Hashed row
    mappedDate: string;
    mappedPosting: string;
    mappedFrom: string;
    mappedTo: string;
    mappedAmount: string;
}

export const MAPPED_COLUMNS = ['from', 'to', 'posting', 'amount', 'date'] as const;

export interface ColumnMapping extends Record<typeof MAPPED_COLUMNS[number], string> {
}

const loadDeduplicatedCsvRows = (): CsvRow[] => {
    const raw = localStorage.getItem('budget_csv_files');
    if (!raw) return [];

    let parsedFiles: CsvFile[];
    try {
        parsedFiles = JSON.parse(raw);
        if (!Array.isArray(parsedFiles)) return [];
    } catch {
        return [];
    }

    const allRows: CsvRow[] = [];

    for (const file of parsedFiles) {
        const result = Papa.parse<CsvRow>(file.content, {
            header: true,
            skipEmptyLines: true,
        });

        if (result.data) {
            const filteredData = blackListFilter(result);
            allRows.push(...filteredData);
        }
    }

    // Deduplicate based on stringified row content
    const seen = new Set<string>();
    const uniqueRows = allRows.filter((row) => {
        const key = JSON.stringify(row);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    return uniqueRows;
}

export const loadCsvSchemas = () => {
    console.log("Loading csv schemas")
    const csvRows = loadDeduplicatedCsvRows();
    return getSchemaKeysFromCsvRows(csvRows);
}

/**
 * Load CSVs from localStorage, parse, and deduplicate rows
 */
export function loadCsvs(): MappedCsvRow[] {
    return loadDeduplicatedCsvRows().map(e => mapCsvRow(e)).filter(e => !!e);
}

function blackListFilter(result: ParseResult<CsvRow>) {
    const blacklist = JSON.parse(localStorage.getItem('blacklist') ?? "[]") as BlackList;
    const filteredData = [...result.data].filter(csvRow => {
        let blackListIdx = blacklist.findIndex(e => csvRow['Exportkonto'].toString().toLowerCase() === e.account);
        let blacklistedWords: string[] = []
        if (blackListIdx !== -1) {
            if (blacklist[blackListIdx].blacklisted.length > 0) {
                blacklistedWords = blacklist[blackListIdx].blacklisted.toLowerCase().trim().split(",")
            }
        }

        for (const blacklisted of blacklistedWords) {
            if (csvRow['Tekst'].toString().toLowerCase().includes(blacklisted.trim())) {
                return false;
            }
        }
        return true;
    })
    return filteredData;
}

const getSchemaKeysFromCsvRows = (csvRows: CsvRow[]): { [key: string]: CsvHeaders } => {
    const result: { [key: string]: CsvHeaders } = {};
    csvRows.forEach(row => {
        const schemaKey = Object.keys(row).join("-");
        if (!result[schemaKey]) {
            result[schemaKey] = Object.keys(row);
        }
    })
    return result;
}

export const getSchemaKeyFromCsvRow = (csvRow: CsvRow) => {
    return Object.keys(csvRow).filter(e => !e.startsWith("mapped")).join("-")
}

export const mapCsvRow = (unmappedRow: CsvRow): MappedCsvRow | undefined => {
    const mapping = getRowColumnMapping(unmappedRow);
    if (!mapping) {
        return undefined;
    }
    const hashId = fnv1aHash(JSON.stringify(unmappedRow));
    const mappingKeys = Object.keys(mapping);
    const mappedCsv: Partial<MappedCsvRow> = {...unmappedRow}
    mappingKeys.forEach(((key, idx) =>
            mappedCsv["mapped" + firstLetterUpper(key)] = unmappedRow[mapping[mappingKeys[idx] as keyof ColumnMapping]].toString().trim()
    ));
    mappedCsv.mappedId = hashId;
    return mappedCsv as MappedCsvRow;
}

export const getRowColumnMapping = (row: CsvRow): ColumnMapping | undefined => {
    const headers = Object.keys(row)
    const schemaKey = headers.join("-")
    const allMappings = JSON.parse(localStorage.getItem('csv_mappings') || '{}');
    let schemaMapping = allMappings[schemaKey];
    if (schemaMapping) {
        const columnMapping = {} as ColumnMapping;
        const keys = Object.keys(schemaMapping);
        keys.forEach(key => columnMapping[key as keyof ColumnMapping] = schemaMapping[key])
        return columnMapping
    }
    return undefined;
}

const firstLetterUpper = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.substring(1)
}

export const getAccountValueMappings = (): Record<string, string> => {
    const mappings = localStorage.getItem('csv_value_mappings');
    if (!mappings) {
        return {};
    }
    return JSON.parse(mappings);
}

export const advancedFilters = (row: MappedCsvRow) => {
    const parsedFilters: string[] = JSON.parse(localStorage.getItem("advanced_filters") ?? "[]");
    if (parsedFilters.length === 0) return true;
    const amount = row.mappedAmount;
    const to = row.mappedTo;
    const from = row.mappedFrom;
    const date = row.mappedDate;
    const posting = row.mappedPosting;
    try {
        const filterEvals = parsedFilters.map(filter => Boolean(eval(filter)));
        return !filterEvals.includes(true);
    } catch (e) {
        alert(`Filter evaluations failed. Got\n ${e}\n\nRemoved all filters to avoid softlock, sorry. Please refresh the page`)
        saveAdvancedFilters([]);
    }
    return false;
}

function fnv1aHash(str: string) {
    let hash = 0x811c9dc5; // FNV offset basis
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = (hash * 0x01000193) >>> 0; // FNV prime (multiply and truncate to 32 bits)
    }
    return hash >>> 0; // Ensure it's an unsigned 32-bit integer
}