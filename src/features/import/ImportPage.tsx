import React from 'react';
import {CSVFile, RawCSV} from "@/model";
import DataMapping from "@/features/mapping/DataMapping";
import {useGlobalContext} from "@/context/GlobalContext";
import CSVImport from "@/features/import/CSVImport";
import CSVFileList from "@/features/import/CSVFileList";
import ImportSteps from "@/features/import/ImportSteps";
import TransactionsSection from "@/features/import/TransactionsSection";
import {LinkButton} from "@/components/LinkButton";
import {mapRawCSVToCSVFile} from "@/utility/csvutils";

const ImportPage = () => {
    const {csvFiles, setCSVFiles, unmappedSchemas, handleSaveMapping, handleRemoveMapping} = useGlobalContext();

    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement> | FileList) => {
        let files: File[] = [];
        if (e instanceof FileList) {
            files = Array.from(e);
        } else {
            files = Array.from(e.target.files || []);
        }
        if (files.length === 0) return;

        const fileDataPromises = files.map((file) => {
            return new Promise<CSVFile>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const arrayBuffer = event.target?.result as ArrayBuffer;
                    const decoded = new TextDecoder('iso-8859-1').decode(new Uint8Array(arrayBuffer));
                    const rawFile: RawCSV = {
                        name: file.name,
                        content: decoded
                    }

                    resolve(mapRawCSVToCSVFile(rawFile));
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
            });
        });

        Promise.all(fileDataPromises).then((newFiles) => {
            const updated = [
                ...csvFiles.filter(
                    (existing) => !newFiles.some((nf) => nf.name === existing.name)
                ),
                ...newFiles,
            ];

            setCSVFiles(updated);
        });
    };

    const handleDelete = (fileName: CSVFile['name']) => {
        const updated = csvFiles.filter((file) => file.name !== fileName);
        setCSVFiles(updated);
    };

    return (
        <div className="min-h-screen flex flex-col items-center gap-4 bg-gradient-to-b from-gray-950 to-[#0a0a0a]">
            {/* Data mapping is a popup that will be used to map data */}
            <DataMapping unmappedSchemas={unmappedSchemas} onSaveMapping={handleSaveMapping}/>

            <div className="w-2/3 mt-10 mb-6">
                <h1 className="text-2xl font-bold mb-2">Import Your Transactions</h1>
                <p className="text-gray-500">Easily import your CSV files, map your data, and review your transactions
                    below. Get started by importing your CSV files!</p>
            </div>
            <ImportSteps/>


            <div className={"w-2/3 mt-10 gap-4 flex flex-col"}>
                <CSVImport onFileImport={handleFileImport}/>
                <CSVFileList csvFiles={csvFiles} onReset={handleRemoveMapping} onRemove={handleDelete}/>
            </div>

            {/* Confirmation and next step */}
            <div className="w-2/3 flex flex-col items-start">
                {csvFiles.length > 0 && <>
                    <span className="text-green-500 font-medium mb-1">CSV file(s) added successfully!</span>
                    <span className="text-gray-200 mb-2">You can now review your transactions below or continue to the next step to filter and categorize your data.</span>
                    <LinkButton href="/income" className="mt-2">Continue to Income</LinkButton>
                </>}
            </div>
            {/* Separation line and section for transactions table */}
            <div className="w-full flex justify-center my-10">
                <div className="w-2/3 border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className={"px-4 w-full"}>
                <TransactionsSection/>
            </div>

        </div>
    );
};

export default ImportPage;
