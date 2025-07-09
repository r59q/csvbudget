import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {CSVFile, CSVHeaders, CsvRow, RawCSV} from "@/model";
import {getCSVMappingData} from "@/data";
import Papa from "papaparse";
import React from "react";

dayjs.extend(customParseFormat)

export const MAPPED_COLUMNS = ['from', 'to', 'text', 'amount', 'date'] as const;
export type SchemaKey = string;

export type ColumnMapping = Record<typeof MAPPED_COLUMNS[number], string>;
export type SchemaColumnMapping = Record<SchemaKey, ColumnMapping>;

export const getSchemaKeyFromCsvRow = (csvRow: CsvRow) => {
    return Object.keys(csvRow).filter(e => !e.startsWith("mapped") && e !== "filename").join("-")
}

export const getSchemaKeyFromHeaders = (headers: CSVHeaders) => {
    return headers.join("-")
}

export const getSchemaKeyFromCsvFile = (file: CSVFile): SchemaKey => {
    const result = Papa.parse<CsvRow>(file.getContent(), {
        header: true,
        skipEmptyLines: true,
    });

    const fields: CSVHeaders = result.meta.fields ?? []
    return getSchemaKeyFromHeaders(fields);
}

export const getHeadersFromRawFile = (file: RawCSV) => {
    const result = Papa.parse<CsvRow>(file.content, {
        header: true,
        skipEmptyLines: true,
    });

    const fields: CSVHeaders = result.meta.fields ?? []
    return fields;
}

export const mapRawCSVToCSVFile = (raw: RawCSV): CSVFile => {
    const schema = {
        headers: getHeadersFromRawFile(raw),
        filename: raw.name
    };
    return {
        name: raw.name,
        getContent: () => raw.content,
        schema: schema,
        schemaKey: getSchemaKeyFromHeaders(schema.headers)
    };
}

export const isSchemaMapped = (row: CsvRow | SchemaKey) => {
    let schemaKey: string;
    if (typeof row === "string") {
        schemaKey = row;
    } else {
        schemaKey = getSchemaKeyFromCsvRow(row);
    }
    const mapping = getCSVMappingData().load()[schemaKey]
    if (!mapping) {
        return false;
    }
    for (const col of MAPPED_COLUMNS) {
        if (!(col in mapping)) {
            return false;
        }
        if (mapping[col].trim().length === 0) {
            return false;
        }
    }
    return true;
}

export const fileImportEventHandler = async (e: React.ChangeEvent<HTMLInputElement> | FileList) => {
    let files: File[] = [];
    if (e instanceof FileList) {
        files = Array.from(e);
    } else {
        files = Array.from(e.target.files || []);
    }
    if (files.length === 0) return;

    const fileDataPromises = files.map((file) => {
        return new Promise<CSVFile>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const arrayBuffer = event.target?.result as ArrayBuffer;
                const decoded = new TextDecoder('iso-8859-1').decode(new Uint8Array(arrayBuffer));
                const rawFile: RawCSV = {
                    name: file.name,
                    content: decoded
                }

                resolve(mapRawCSVToCSVFile(rawFile));
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    });
    return await Promise.all(fileDataPromises);
};
