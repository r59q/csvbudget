import React from 'react';
import { MdOutlinePlaylistAddCheck, MdFileDownload, MdUploadFile, MdSchema } from 'react-icons/md';

interface ImportStepsProps {}

const ImportSteps = ({}: ImportStepsProps) => {
    return (
        <ol className="w-2/3 bg-white rounded-lg shadow p-6 mb-10 list-decimal list-inside space-y-4 border border-gray-200">
            <div className="flex items-center mb-4 gap-2">
                <span className="text-xl font-bold flex items-center gap-2">
                    Import Steps
                </span>
            </div>
            <li className="flex gap-4 items-center">
                <span className="flex items-center justify-center shrink-0"><MdFileDownload className="text-green-500" size={22} /></span>
                <span className="flex-1">
                    <span className="font-semibold">Acquire a CSV file:</span> Download your transaction history as a CSV file from your online banking or financial service. Most banks offer an export or download option in their web interface.
                </span>
            </li>
            <li className="flex gap-4 items-center">
                <span className="flex items-center justify-center shrink-0"><MdUploadFile className="text-blue-500" size={22} /></span>
                <span className="flex-1">
                    <span className="font-semibold">Import the CSV file:</span> Use the import tool below to upload your CSV file. You can drag and drop or use the file picker.
                </span>
            </li>
            <li className="flex gap-4 items-center">
                <span className="flex items-center justify-center shrink-0"><MdSchema className="text-purple-500" size={22} /></span>
                <span className="flex-1">
                    <span className="font-semibold">Describe the CSV:</span> Map the columns in your CSV to the correct fields (such as <span className="italic">amount</span>, <span className="italic">date</span>, <span className="italic">text</span>, etc.) so the tool knows how to interpret your data.
                </span>
            </li>
        </ol>
    );
};

export default ImportSteps;

