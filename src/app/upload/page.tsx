'use client';

import React, {useEffect, useState} from 'react';
import Link from "next/link";
import {getCSVFilesData, getCSVMappingData} from "@/data";
import {
    ColumnMapping,
    getHeadersFromFile,
    getSchemaKeyFromCsvFile,
    isSchemaMapped,
    MAPPED_COLUMNS,
    SchemaKey
} from "@/utility/csvutils";
import {CSVHeaders} from "@/model";
import useCSVRows from "@/hooks/CSVRows";

type CsvFile = { name: string; content: string };

interface UnmappedSchema {
    key: SchemaKey;
    headers: CSVHeaders;
}

export default function CsvUploader() {
    const [uploadedFiles, setUploadedFiles] = useState<CsvFile[]>([]);
    const [unmappedSchemas, setUnmappedSchemas] = useState<UnmappedSchema[]>([])
    const {csvSchemas} = useCSVRows();

    // Load existing CSVs from localStorage on mount
    useEffect(() => {
        const stored = getCSVFilesData().load();
        setUploadedFiles(stored);
    }, []);

    useEffect(() => {
        const unmapped: UnmappedSchema[] = []
        uploadedFiles.forEach(file => {
            const schemaKeyFromCsvFile = getSchemaKeyFromCsvFile(file);
            if (!isSchemaMapped(schemaKeyFromCsvFile)) {
                unmapped.push({
                    key: schemaKeyFromCsvFile,
                    headers: getHeadersFromFile(file)
                });
            }
        })
        setUnmappedSchemas(unmapped)
    }, [uploadedFiles]);


    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const fileDataPromises = files.map((file) => {
            return new Promise<CsvFile>((resolve, reject) => {
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
                ...uploadedFiles.filter(
                    (existing) => !newFiles.some((nf) => nf.name === existing.name)
                ),
                ...newFiles,
            ];

            setUploadedFiles(getCSVFilesData().save(updated));
        });
    };

    const handleDelete = (fileName: string) => {
        const updated = uploadedFiles.filter((file) => file.name !== fileName);
        setUploadedFiles(getCSVFilesData().save(updated));
    };
    const handleSaveMapping = (mapping: Record<typeof MAPPED_COLUMNS[number], string>, schemaKey: SchemaKey) => {
        const newData = {...getCSVMappingData().load()};
        newData[schemaKey] = mapping;
        getCSVMappingData().save(newData);
        if (isSchemaMapped(schemaKey)) {
            setUnmappedSchemas([...unmappedSchemas.filter(e => e.key != schemaKey)])
        }
    }

    return (
        <>
            {unmappedSchemas.length > 0 && <div className={"backdrop-blur-sm top-0 absolute w-screen h-screen"}>
                <div className={"flex justify-center items-center h-full"}>
                    <TransformData {...{unmappedSchemas}} onSaveMapping={handleSaveMapping}/>
                </div>
            </div>}
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

                    {uploadedFiles.length > 0 ? (
                        <ul className="space-y-2 text-sm text-gray-800">
                            {uploadedFiles.map((file, idx) => (
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
                        return <p>{schema}</p>
                    })}
                </div>
            </div>
        </>
    );
}

interface TransformDataProps {
    unmappedSchemas: UnmappedSchema[]
    onSaveMapping: (mapping: Record<typeof MAPPED_COLUMNS[number], string>, schemaKey: SchemaKey) => void;
}

const TransformData = ({unmappedSchemas, onSaveMapping}: TransformDataProps) => {
    const [mapping, setMapping] = useState<Partial<Record<typeof MAPPED_COLUMNS[number], string>>>({});

    const unmappedKey = unmappedSchemas[0].key;
    const unmappedHeaders = unmappedSchemas[0].headers;

    const handleMappingChange = (target: keyof ColumnMapping, source: string) => {
        const newState = {...mapping, [target]: source};
        setMapping(newState)
    };

    return <>
        <div className={"bg-gray-900 p-4 rounded-md flex flex-col gap-4"}>
            <h1 className={"text-lg"}>Transform data ({unmappedSchemas.length} left)</h1>
            <table className="w-full border text-sm">
                <thead>
                <tr className="bg-gray-950">
                    <th className="p-2 border">Target Column</th>
                    <th className="p-2 border">CSV Column</th>
                </tr>
                </thead>
                <tbody>
                {MAPPED_COLUMNS.map((field) => {
                        const value = mapping ? mapping[field] || '' : '';
                        return <tr key={field}>
                            <td className="p-2 border font-semibold capitalize">{field}</td>
                            <td className="p-2 border">
                                <select
                                    className="w-full p-1 border"
                                    value={value}
                                    onChange={(e) => handleMappingChange(field, e.target.value)}
                                >
                                    <option value="" className={"bg-gray-900"}>Select column</option>
                                    {unmappedHeaders.map((header) => (
                                        <option className={"bg-gray-950"} key={header} value={header}>
                                            {header}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    }
                )}
                </tbody>
            </table>
            <button onClick={() => onSaveMapping(mapping as Record<typeof MAPPED_COLUMNS[number], string>, unmappedKey)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Save Mapping
            </button>
        </div>
    </>
}
