import React from "react";

interface FileSchemasListProps {
  csvSchemas: Record<string, any>;
  onReset: (schemaKey: string) => void;
}

const FileSchemasList: React.FC<FileSchemasListProps> = ({ csvSchemas, onReset }) => (
  <div className="p-4 rounded-lg border border-gray-300 mt-4">
    <h2 className="text-xl font-semibold mb-4">File Schemas</h2>
    {Object.keys(csvSchemas).length === 0 ? (
      <p className="text-sm text-gray-500">No schemas detected yet.</p>
    ) : (
      <ul className="space-y-2 text-sm text-gray-800">
        {Object.keys(csvSchemas).map((schema) => {
          const schemaData = csvSchemas[schema];
          return (
            <li key={schema} className="flex items-center justify-between p-2 bg-gray-100 rounded">
              <span>{schemaData.filename}</span>
              <button
                className="text-red-500 hover:text-red-700 text-xs border border-red-300 rounded px-2 py-1 ml-2"
                onClick={() => onReset(schema)}
              >
                Reset
              </button>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

export default FileSchemasList;

