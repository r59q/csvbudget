import {useEffect, useState} from "react";
import {ColumnMapping, SchemaColumnMapping} from "@/utility/csvutils";
import Papa, {ParseResult} from "papaparse";
import {CSVHeaders, CsvRow, CSVRowId, CSVSchemas, MappedCSVRow, RowCategoryMap} from "@/model";
import {getCSVFilesData} from "@/data";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat)

/**
 * Loads the CSV data from localstorage
 */
const useCSVRows = () => {
    const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
    const [mappedCSVRows, setMappedCSVRows] = useState<MappedCSVRow[]>([]);
    const [csvSchemas, setCSVSchemas] = useState<CSVSchemas>({});

    useEffect(() => {
        const loaded = loadDeduplicatedCsvRows();
        setCsvRows(loaded);
        const mapped = loaded
            .map(e => mapCsvRow(e))
            .filter(e => !!e);
        setMappedCSVRows(mapped);
        setCSVSchemas(getCSVSchemas(loaded));
    }, [])

    const getById = (rowId: CSVRowId): MappedCSVRow | undefined => {
        return mappedCSVRows.find(row => row.mappedId === rowId);
    }

    return {csvRows, mappedCSVRows, csvSchemas, getById};
};

/**
 * Load CSVs from localStorage, parse, and deduplicate rows
 */
const loadDeduplicatedCsvRows = (): CsvRow[] => {
    const csvFilesData = getCSVFilesData();
    const allRows: CsvRow[] = [];

    for (const file of csvFilesData.load()) {
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
    return allRows.filter((row) => {
        const key = JSON.stringify(row);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/**
 * Adding typing by appending the column mapped fields and giving the row a deterministic ID.
 */
const mapCsvRow = (unmappedRow: CsvRow): MappedCSVRow | undefined => {
    const mapping = getRowColumnMapping(unmappedRow);
    if (!mapping) {
        return undefined;
    }
    try {
        const hashId = fnv1aHash(JSON.stringify(unmappedRow));
        return {
            ...unmappedRow,
            mappedFrom: unmappedRow[mapping["from"]],
            mappedTo: unmappedRow[mapping["to"]],
            mappedAmount: parseFloat(unmappedRow[mapping["amount"]]),
            mappedId: hashId,
            mappedDate: unmappedRow[mapping["date"]],
            mappedText: unmappedRow[mapping["posting"]],
        } as MappedCSVRow;
    } catch (e) {
        alert(e)
    }
    return undefined
}


const getCSVSchemas = (csvRows: CsvRow[]) => {
    const result: { [key: string]: CSVHeaders } = {};
    csvRows.forEach(row => {
        const schemaKey = Object.keys(row).join("-");
        if (!result[schemaKey]) {
            result[schemaKey] = Object.keys(row);
        }
    })
    return result;
}

const getRowColumnMapping = (row: CsvRow): ColumnMapping | undefined => {
    const headers = Object.keys(row)
    const schemaKey = headers.join("-")
    const allMappings = JSON.parse(localStorage.getItem('csv_mappings') || '{}');
     const schemaMapping = allMappings[schemaKey];
    if (schemaMapping) {
        const columnMapping = {} as ColumnMapping;
        const keys = Object.keys(schemaMapping);
        keys.forEach(key => columnMapping[key as keyof ColumnMapping] = schemaMapping[key])
        return columnMapping
    }
    return undefined;
}

/**
 * Used to generate ID's for each row by hashing the stringified version of a row.
 */
const fnv1aHash = (str: string) => {
    let hash = 0x811c9dc5; // FNV offset basis
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = (hash * 0x01000193) >>> 0; // FNV prime (multiply and truncate to 32 bits)
    }
    return hash >>> 0; // Ensure it's an unsigned 32-bit integer
}

type BlackList = { account: string, blacklisted: string }[]

const blackListFilter = (result: ParseResult<CsvRow>) => {
    const blacklist = JSON.parse(localStorage.getItem('blacklist') ?? "[]") as BlackList;
    const filteredData = [...result.data].filter(csvRow => {
        const blackListIdx = blacklist.findIndex(e => csvRow['Exportkonto'].toString().toLowerCase() === e.account);
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


export default useCSVRows;