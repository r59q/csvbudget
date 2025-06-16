'use client';

import React, {useEffect, useState} from 'react';
import {getCSVMappingData} from "@/data";
import {
    ColumnMapping,
    getHeadersFromFile,
    getSchemaKeyFromCsvFile,
    isSchemaMapped,
    SchemaKey
} from "@/utility/csvutils";
import {CSVFile, UnmappedSchema} from "@/model";
import DataMapping from "@/features/DataMapping";
import {useGlobalContext} from "@/context/GlobalContext";
import useCSVRows from "@/hooks/CSVRows";

function useUnmappedSchemas(uploadedFiles: CSVFile[]): [UnmappedSchema[], React.Dispatch<React.SetStateAction<UnmappedSchema[]>>] {
    const [unmappedSchemas, setUnmappedSchemas] = useState<UnmappedSchema[]>([]);

    useEffect(() => {
        const unmapped: UnmappedSchema[] = [];
        uploadedFiles.forEach(file => {
            const schemaKeyFromCsvFile = getSchemaKeyFromCsvFile(file);
            if (!isSchemaMapped(schemaKeyFromCsvFile)) {
                unmapped.push({
                    key: schemaKeyFromCsvFile,
                    headers: getHeadersFromFile(file)
                });
            }
        });
        setUnmappedSchemas(unmapped);
    }, [uploadedFiles]);

    return [unmappedSchemas, setUnmappedSchemas];
}

export default function CsvUploader() {
    const {csvFiles, setCSVFiles} = useGlobalContext();
    const {csvSchemas} = useCSVRows();
    const [unmappedSchemas, setUnmappedSchemas] = useUnmappedSchemas(csvFiles);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const fileDataPromises = files.map((file) => {
            return new Promise<CSVFile>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const arrayBuffer = event.target?.result as ArrayBuffer;
                    const decoded = new TextDecoder('iso-8859-1').decode(new Uint8Array(arrayBuffer));

                    resolve({
                        name: file.name,
                        content: decoded,
                    });
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
            });
        });

        Promise.all(fileDataPromises).then((newFiles) => {
            const updated = [
                ...csvFiles.filter(
                    (existing) => !newFiles.some((nf) => nf.name === existing.name)
                ),
                ...newFiles,
            ];

            setCSVFiles(updated);
        });
    };

    const handleDelete = (fileName: string) => {
        const updated = csvFiles.filter((file) => file.name !== fileName);
        setCSVFiles(updated);
    };
    const handleSaveMapping = (mapping: ColumnMapping, schemaKey: SchemaKey) => {
        const newData = {...getCSVMappingData().load()};
        newData[schemaKey] = mapping;
        getCSVMappingData().save(newData);
        if (isSchemaMapped(schemaKey)) {
            setUnmappedSchemas([...unmappedSchemas.filter(e => e.key != schemaKey)])
        }
    }

    return (
        <>
            <DataMapping unmappedSchemas={unmappedSchemas} onSaveMapping={handleSaveMapping}/>
            <div className={"w-full max-w-md mx-auto mt-10 gap-4 flex flex-col"}>
                <div className="p-4 rounded-lg border border-gray-300">
                    <h2 className="text-xl font-semibold mb-4">Upload Budget CSVs</h2>
                    <input
                        type="file"
                        accept=".csv"
                        multiple
                        onChange={handleFileUpload}
                        className="mb-4"
                    />

                    {csvFiles.length > 0 ? (
                        <ul className="space-y-2 text-sm text-gray-800">
                            {csvFiles.map((file, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-center justify-between p-2 bg-gray-100 rounded"
                                >
                                    <span>{file.name}</span>
                                    <button
                                        onClick={() => handleDelete(file.name)}
                                        className="text-red-500 hover:text-red-700 text-xs"
                                    >
                                        🗑️ Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500">No CSVs uploaded yet.</p>
                    )}
                </div>
                <div>
                    {Object.keys(csvSchemas).map(schema => {
                        return <p key={schema}>{schema}</p>
                    })}
                </div>
            </div>
        </>
    );
}
