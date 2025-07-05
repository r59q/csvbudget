import React, { useRef } from "react";
import { MdFileUpload, MdInsertDriveFile } from "react-icons/md";

interface CSVImportProps {
  csvFiles: { name: string }[];
  onFileImport: (e: React.ChangeEvent<HTMLInputElement> | FileList) => void;
  onDelete: (fileName: string) => void;
}

const CSVImport: React.FC<CSVImportProps> = ({ csvFiles, onFileImport, onDelete }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileImport(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="p-6 rounded-lg border border-gray-200 bg-blue-50 shadow-sm flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4">
        <MdFileUpload className="text-blue-500" size={28} />
        <h2 className="text-xl font-semibold">Import Budget CSVs</h2>
      </div>
      <label
        className="w-full flex flex-col items-center px-4 py-6 bg-white text-blue-600 rounded-lg shadow-md tracking-wide uppercase border border-blue-300 cursor-pointer hover:bg-blue-100 transition mb-4"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
      >
        <MdInsertDriveFile size={32} className="mb-2 text-blue-400" />
        <span className="mt-2 text-base leading-normal">Select or drag & drop CSV files</span>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          multiple
          onChange={onFileImport}
          className="hidden"
        />
      </label>
      {csvFiles.length > 0 ? (
        <ul className="space-y-2 text-sm text-gray-800 w-full">
          {csvFiles.map((file, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between p-2 bg-blue-100 rounded border border-blue-200"
            >
              <span className="flex items-center gap-2"><MdInsertDriveFile className="text-blue-400" />{file.name}</span>
              <button
                onClick={() => onDelete(file.name)}
                className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded"
              >
                🗑️ Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-blue-500">No CSVs imported yet.</p>
      )}
    </div>
  );
};

export default CSVImport;
