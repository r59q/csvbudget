import React from "react";
import {CSVFile} from "@/model";
import {MdDelete, MdInsertDriveFile, MdRefresh} from "react-icons/md";
import {SchemaKey} from "@/utility/csvutils";

interface FileSchemasListProps {
    csvFiles: CSVFile[];
    onRemove: (schemaKey: CSVFile['name']) => void;
    onReset: (schemaKey: SchemaKey) => void;
}

const CSVFileList: React.FC<FileSchemasListProps> = ({csvFiles, onRemove, onReset}) => {

    return <div className="p-6 rounded-lg border border-gray-700 bg-gray-900 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-100 flex items-center gap-2">
            <MdInsertDriveFile className="text-blue-500" size={22}/> Imported Files
        </h2>
        {Object.keys(csvFiles).length === 0 ? (
            <p className="text-sm text-gray-500">No files imported</p>
        ) : (
            <ul className="space-y-2 text-sm">
                {csvFiles.map((file) => {
                    return (
                        <li
                            key={file.name}
                            className="flex items-center justify-between p-3 bg-gray-800 rounded-lg shadow-sm border border-gray-600 hover:bg-gray-600 transition">
                            <div className="flex items-center gap-3">
                                <MdInsertDriveFile className="text-blue-400" size={20}/>
                                <span
                                    className="font-medium text-gray-100 text-base">{file.name}</span>
                                <span
                                    className="ml-2 px-2 py-0.5 text-xs rounded bg-gray-600 text-gray-300">{file.schema.headers.length} columns</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-white border border-blue-500 rounded px-3 py-1 bg-gray-800 hover:bg-blue-600 transition"
                                    onClick={() => onReset(file.schemaKey)}
                                    title="Reset schema mapping"
                                >
                                    <MdRefresh size={16}/> Reset
                                </button>
                                <button
                                    className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-white border border-red-500 rounded px-3 py-1 bg-gray-800 hover:bg-red-600 transition"
                                    onClick={() => onRemove(file.name)}
                                    title="Remove file and mapping"
                                >
                                    <MdDelete size={16}/> Remove
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        )}
    </div>

}
export default CSVFileList;
