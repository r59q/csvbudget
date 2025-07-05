import React, { useRef } from "react";
import {MdFileDownload, MdFileUpload, MdInsertDriveFile} from "react-icons/md";

interface CSVImportProps {
  onFileImport: (e: React.ChangeEvent<HTMLInputElement> | FileList) => void;
}

const CSVImport = ({ onFileImport }: CSVImportProps) => {
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
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex flex-col items-center">
      <div className="flex self-start gap-2 mb-4">
        <MdFileDownload className="text-blue-500" size={28} />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Import Budget CSVs</h2>
      </div>
      <label
        className="w-full flex flex-col items-center px-4 py-6 bg-white dark:bg-gray-700 text-blue-600 rounded-lg shadow-md tracking-wide uppercase border border-blue-300 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-600 transition mb-4"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
      >
        <MdInsertDriveFile size={32} className="mb-2 text-blue-400" />
        <span className="mt-2 text-base leading-normal text-gray-800 dark:text-gray-200">Select or drag & drop CSV files</span>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          multiple
          onChange={onFileImport}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default CSVImport;
