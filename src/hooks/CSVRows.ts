import {useEffect, useState} from "react";
import {ColumnMapping, getSchemaKeyFromCsvRow} from "@/utility/csvutils";
import Papa, {ParseResult} from "papaparse";
import {CSVFile, CsvRow, CSVRowId, CSVSchemas, MappedCSVRow} from "@/model";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {useGlobalContext} from "@/context/GlobalContext";
import {detectDateFormat} from "@/utility/datautils";

dayjs.extend(customParseFormat)

/**
 * Loads the CSV data from localstorage
 */
const useCSVRows = () => {
    const {csvFiles, columnMappings} = useGlobalContext();
    const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
    const [mappedCSVRows, setMappedCSVRows] = useState<MappedCSVRow[]>([]);
    const [csvSchemas, setCSVSchemas] = useState<CSVSchemas>({});
    const [dateFormat, setDateFormat] = useState<string>("DD.MM.YYYY");

    useEffect(() => {
        const loaded = loadDeduplicatedCsvRows(csvFiles);
        setCsvRows(loaded);
        const mapped = loaded
            .map(e => mapCsvRow(e, columnMappings[getSchemaKeyFromCsvRow(e)]))
            .filter(e => !!e);
        setDateFormat(detectDateFormat(mapped));
        setMappedCSVRows(mapped);
        setCSVSchemas(getCSVSchemas(loaded));
    }, [csvFiles, columnMappings])

    const getById = (rowId: CSVRowId): MappedCSVRow | undefined => {
        return mappedCSVRows.find(row => row.mappedId === rowId);
    }

    return {csvRows, mappedCSVRows, csvSchemas, getById, dateFormat};
};

/**
 * Load CSVs from localStorage, parse, and deduplicate rows
 */
const loadDeduplicatedCsvRows = (files: CSVFile[]): CsvRow[] => {
    const allRows: CsvRow[] = [];

    for (const file of files) {
        const result = Papa.parse<CsvRow>(file.content, {
            header: true,
            skipEmptyLines: true,
        });

        if (result.data) {
            const filteredData = blackListFilter(result).map(e => ({...e, filename: file.name}));
            allRows.push(...filteredData);
        }
    }

    // Deduplicate based on stringified row content
    const seen = new Set<string>();
    return allRows.filter((row) => {
        const { filename, ...rest } = row; // Exclude filename from deduplication
        const key = JSON.stringify(rest);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/**
 * Adding typing by appending the column mapped fields and giving the row a deterministic ID.
 */
const mapCsvRow = (unmappedRow: CsvRow, mapping: ColumnMapping | undefined): MappedCSVRow | undefined => {
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
            mappedText: unmappedRow[mapping["text"]],
        } as MappedCSVRow;
    } catch (e) {
        alert(e)
    }
    return undefined
}


const getCSVSchemas = (csvRows: CsvRow[]) => {
    const result: CSVSchemas = {};
    csvRows.forEach(row => {
        const schemaKey = Object.keys(row).filter(e => e !== "filename").join("-");
        if (!result[schemaKey]) {
            result[schemaKey] = {headers: Object.keys(row), filename: row.filename};
        }
    })
    return result;
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