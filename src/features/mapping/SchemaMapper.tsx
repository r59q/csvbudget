import React, {useState} from 'react';
import {UnmappedSchema} from "@/model";
import {ColumnMapping, MAPPED_COLUMNS, SchemaColumnMapping, SchemaKey} from "@/utility/csvutils";
import {useGlobalContext} from "@/context/GlobalContext";
import ColumnMappingRow from "./ColumnMappingRow";

interface Props {
    unmappedSchema: UnmappedSchema
    onSaveMapping: (mapping: ColumnMapping, schemaKey: SchemaKey) => void;
}

const SchemaMapper = ({unmappedSchema, onSaveMapping}: Props) => {
    const {currency, setCurrency} = useGlobalContext();
    const [mapping, setMapping] = useState<Partial<ColumnMapping>>({});

    const handleMappingChange = (target: keyof SchemaColumnMapping, source: string) => {
        const newState = {...mapping, [target]: source};
        setMapping(newState)
    };

    return <>
        <div className={"bg-gray-900 p-4 rounded-md flex flex-col gap-4"}>
            <h1 className={"text-lg"}>Describe your CSV</h1>
            <table className="w-full border text-sm">
                <thead>
                <tr className="bg-gray-950">
                    <th className="p-2 border min-w-30">Field</th>
                    <th className="p-2 border min-w-50">CSV Column</th>
                </tr>
                </thead>
                <tbody>
                {MAPPED_COLUMNS.map((field) => (
                    <ColumnMappingRow
                        key={field}
                        field={field}
                        value={mapping ? mapping[field] || '' : ''}
                        headers={unmappedSchema.headers}
                        onChange={handleMappingChange}
                    />
                ))}
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