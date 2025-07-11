import React from 'react';
import { MdFileDownload, MdUploadFile, MdSchema } from 'react-icons/md';
import {LinkButton} from "@/components/LinkButton";

const ImportSteps = ({}: object) => {
    return (
        <>
            <ol className="w-2/3 bg-gray-900 rounded-lg shadow p-6 mb-10 list-decimal list-inside space-y-4 border border-gray-700">
                <div className="flex items-center mb-4 gap-2">
                    <span className="text-xl font-bold flex items-center gap-2 text-gray-100">
                        Import Steps
                    </span>
                </div>
                <li className="flex gap-4 items-center">
                    <span className="flex items-center justify-center shrink-0"><MdFileDownload className="text-green-500" size={22} /></span>
                    <span className="flex-1 text-gray-200">
                        <span className="font-semibold">Acquire a CSV file:</span> Download your transaction history as a CSV file from your online banking or financial service. Most banks offer an export or download option in their web interface. Check out the example by pressing the button below.
                    </span>
                </li>
                <li className="flex gap-4 items-center">
                    <span className="flex items-center justify-center shrink-0"><MdUploadFile className="text-blue-500" size={22} /></span>
                    <span className="flex-1 text-gray-200">
                        <span className="font-semibold">Import the CSV file:</span> Use the import tool below to import your CSV file. You can drag and drop or use the file picker.
                        <p className={"ml-2 text-md text-gray-400"}><span className="font-semibold">Note:</span> files are stored in your browser and is not being submitted to the cloud.</p>
                    </span>
                </li>
                <li className="flex gap-4 items-center">
                    <span className="flex items-center justify-center shrink-0"><MdSchema className="text-purple-500" size={22} /></span>
                    <span className="flex-1 text-gray-200">
                        <span className="font-semibold">Describe the CSV:</span> Map the columns in your CSV to the correct fields (such as <span className="italic">amount</span>, <span className="italic">date</span>, <span className="italic">text</span>, etc.) so the tool knows how to interpret your data.
                    </span>
                </li>
                <div className="flex justify-end pt-4">
                    <LinkButton
                        href="/example.csv"
                        download
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium shadow"
                    >
                        <MdFileDownload size={18} />
                        Download Example CSV
                    </LinkButton>
                </div>
            </ol>
        </>
    );
};

export default ImportSteps;
