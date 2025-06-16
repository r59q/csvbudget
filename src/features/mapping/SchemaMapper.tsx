import React, {useState} from 'react';
import {UnmappedSchema} from "@/model";
import {ColumnMapping, MAPPED_COLUMNS, SchemaColumnMapping, SchemaKey} from "@/utility/csvutils";

interface Props {
    unmappedSchema: UnmappedSchema
    onSaveMapping: (mapping: ColumnMapping, schemaKey: SchemaKey) => void;
}

const SchemaMapper = ({unmappedSchema, onSaveMapping}: Props) => {
    const [mapping, setMapping] = useState<Partial<ColumnMapping>>({});

    const handleMappingChange = (target: keyof SchemaColumnMapping, source: string) => {
        const newState = {...mapping, [target]: source};
        setMapping(newState)
    };

    return <>
        <div className={"bg-gray-900 p-4 rounded-md flex flex-col gap-4"}>
            <h1 className={"text-lg"}>Transform data</h1>
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
                                    {unmappedSchema.headers.map((header) => (
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
            <button onClick={() => onSaveMapping(mapping as Record<typeof MAPPED_COLUMNS[number], string>, unmappedSchema.key)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Save Mapping
            </button>
        </div>
    </>
}
export default SchemaMapper;