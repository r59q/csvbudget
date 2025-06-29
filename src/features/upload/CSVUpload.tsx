import React from "react";

interface FileUploadProps {
  csvFiles: { name: string }[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: (fileName: string) => void;
}

const CSVUpload: React.FC<FileUploadProps> = ({ csvFiles, onFileUpload, onDelete }) => (
  <div className="p-4 rounded-lg border border-gray-300">
    <h2 className="text-xl font-semibold mb-4">Upload Budget CSVs</h2>
    <input
      type="file"
      accept=".csv"
      multiple
      onChange={onFileUpload}
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
              onClick={() => onDelete(file.name)}
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
);

export default CSVUpload;

