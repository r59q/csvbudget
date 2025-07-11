"use client";
import {useEffect, useState} from "react";
import {CSVFile, UnmappedSchema} from "@/model";
import {getCSVMappingData} from "@/data";
import {
    SchemaKey,
    getSchemaKeyFromCsvFile,
    getHeadersFromRawFile,
    SchemaColumnMapping,
    ColumnMapping, getSchemaKeyFromHeaders
} from "@/utility/csvutils";

const useSchemaMapping = (files: CSVFile[]) => {
    const [columnMappings, setColumnMappings] = useState<SchemaColumnMapping>({});

    useEffect(() => {
        setColumnMappings(getCSVMappingData().load());
    }, []);

    // Derive unmapped schemas directly from files and columnMappings
    const unmappedSchemas: UnmappedSchema[] = files.reduce((acc, file) => {
        const schemaKeyFromCsvFile = getSchemaKeyFromCsvFile(file);
        if (!columnMappings[schemaKeyFromCsvFile]) {
            acc.push({
                key: schemaKeyFromCsvFile,
                headers: file.schema.headers
            });
        }
        return acc;
    }, [] as UnmappedSchema[]);

    const handleSaveMapping = (mapping: ColumnMapping, schemaKey: SchemaKey) => {
        const newData = { ...columnMappings };
        newData[schemaKey] = mapping;
        setColumnMappings(getCSVMappingData().save(newData));
    };

    const handleRemoveMapping = (schemaKey: SchemaKey) => {
        const newData = { ...columnMappings };
        delete newData[schemaKey];
        setColumnMappings(getCSVMappingData().save(newData));
    };

    return {
        unmappedSchemas,
        handleSaveMapping,
        handleRemoveMapping,
        columnMappings,
        setColumnMappings,
    };
};

export default useSchemaMapping;
