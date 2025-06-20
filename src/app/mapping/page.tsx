'use client';

import React, {useEffect, useState} from 'react';
import {SchemaColumnMapping, getSchemaKeyFromCsvRow, MAPPED_COLUMNS, ColumnMapping} from "@/utility/csvutils";
import Link from "next/link";
import useCSVRows from "@/hooks/CSVRows";
import useAccountMapping from "@/hooks/AccountMapping";

export default function MappingPage() {
    const {mappedCSVRows, csvSchemas} = useCSVRows()
    const {accountValueMappings, addAccountMapping, removeAccountMapping} = useAccountMapping();
    const [mappings, setMappings] = useState<Partial<SchemaColumnMapping>>({});
    const [newKey, setNewKey] = useState('');
    const [newLabel, setNewLabel] = useState('');
    useEffect(() => {
        setMappings(JSON.parse(localStorage.getItem("csv_mappings")!))
    }, []);

    const schemaKeys = Object.keys(csvSchemas);

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <div className={"mb-4"}>
                <Link href={"/filter"} className="text-lg font-bold underline">{"Filter Data >>"}</Link>
            </div>

            <div className={"flex flex-col gap-12"}>
                {schemaKeys.map(schemaKey => <div key={schemaKey}>
                    <p className={"text-xs"}>{schemaKey}</p>
                    <SchemaMappings schema={csvSchemas[schemaKey]} {...{schemaKey}}/>
                </div>)}
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">From Value Mapping</h3>

                <div className="flex items-center gap-2 mb-2">
                    <input
                        className="border p-1 w-48"
                        placeholder="Original value"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                    />
                    <input
                        className="border p-1 w-48"
                        placeholder="Label"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                    />
                    <button
                        className="bg-green-600 text-white px-2 py-1 rounded"
                        onClick={() => {
                            if (!newKey || !newLabel) return;
                            addAccountMapping(newKey, newLabel)
                            setNewKey('');
                            setNewLabel('');
                        }}>
                        Add
                    </button>
                </div>

                {Object.keys(accountValueMappings).length > 0 && (
                    <ul className="text-sm text-gray-700">
                        {Object.entries(accountValueMappings).map(([key, label]) => (
                            <li key={key} className="flex justify-between items-center">
                                <span>{key} → <strong>{label}</strong></span>
                                <button
                                    className="text-red-500 text-xs"
                                    onClick={() => {
                                        removeAccountMapping(key);
                                    }}>
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {mappedCSVRows.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-2">Preview</h3>
                    <table className="w-full border text-sm">
                        <thead className="bg-gray-900">
                        <tr>
                            <th className="p-2 border">From</th>
                            <th className="p-2 border">Posting</th>
                            <th className="p-2 border">Amount</th>
                            <th className="p-2 border">Date</th>
                        </tr>
                        </thead>
                        <tbody>
                        {mappedCSVRows.map((row, idx) => {
                            const schemaKey = getSchemaKeyFromCsvRow(row);
                            const mapping = mappings[schemaKey as keyof SchemaColumnMapping] as unknown as ColumnMapping;
                            if (!mapping) {
                                return null;
                            }
                            return (
                                <tr key={idx} className="even:bg-gray-900">
                                    <td className="p-2 border">
                                        {accountValueMappings[row[mapping.from!]!] || row[mapping.from!] || ''}
                                    </td>
                                    <td className="p-2 border">{row[mapping.posting!] || ''}</td>
                                    <td className="p-2 border">{formatAmount(row[mapping.amount!].toString() || '')}</td>
                                    <td className="p-2 border">{row[mapping.date!] || ''}</td>
                                    <td>{row.type}</td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

interface SchemaMappingsProps {
    schemaKey: string;
    schema: string[];
}

const SchemaMappings = ({schemaKey, schema}: SchemaMappingsProps) => {
    const [mapping, setMapping] = useState<Partial<ColumnMapping>>({});
    useEffect(() => {
        // Auto-detect mapping
        const allMappings = JSON.parse(localStorage.getItem('csv_mappings') || '{}');

        if (allMappings[schemaKey]) {
            setMapping(allMappings[schemaKey]);
        }
    }, [schemaKey]);

    const saveMapping = () => {
        const allMappings = JSON.parse(localStorage.getItem('csv_mappings') || '{}');
        allMappings[schemaKey] = mapping;
        localStorage.setItem('csv_mappings', JSON.stringify(allMappings));
        alert('Mapping saved!');
    };

    const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
        setMapping(prev => ({
            ...prev,
            [field]: value
        }));
    }

    return <>
        <h2 className="text-xl font-bold mb-4">Map CSV Columns</h2>

        <table className="w-full mb-6 border text-sm">
            <thead>
            <tr className="bg-gray-950">
                <th className="p-2 border">Target Column</th>
                <th className="p-2 border">CSV Column</th>
            </tr>
            </thead>
            <tbody>
            {MAPPED_COLUMNS.map((field) => (
                <tr key={field}>
                    <td className="p-2 border font-semibold capitalize">{field}</td>
                    <td className="p-2 border">
                        <select
                            className="w-full p-1 border"
                            value={mapping[field] || ''}
                            onChange={(e) => handleMappingChange(field, e.target.value)}
                        >
                            <option value="" className={"bg-gray-900"}>Select column</option>
                            {schema.map((header) => (
                                <option className={"bg-gray-950"} key={header} value={header}>
                                    {header}
                                </option>
                            ))}
                        </select>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>

        <button
            onClick={saveMapping}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
            Save Mapping
        </button>
    </>
}

function formatAmount(raw: string): string {
    return raw.replace(/\./g, '').replace(',', '.').trim();
}