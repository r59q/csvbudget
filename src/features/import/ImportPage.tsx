import React from 'react';
import {CSVFile} from "@/model";
import DataMapping from "@/features/mapping/DataMapping";
import {useGlobalContext} from "@/context/GlobalContext";
import useCSVRows from "@/hooks/CSVRows";
import {useTransactionsContext} from "@/context/TransactionsContext";
import CSVImport from "@/features/import/CSVImport";
import CSVFileList from "@/features/import/CSVFileList";
import TransactionTable from "@/features/transaction/TransactionTable";
import ImportSteps from "@/features/import/ImportSteps";

const ImportPage = () => {
    const {csvFiles, setCSVFiles, unmappedSchemas, handleSaveMapping, handleRemoveMapping} = useGlobalContext();
    const {transactions} = useTransactionsContext();
    const {csvSchemas} = useCSVRows();

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

                    resolve({
                        name: file.name,
                        content: decoded,
                    });
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

    const handleDelete = (fileName: string) => {
        const updated = csvFiles.filter((file) => file.name !== fileName);
        setCSVFiles(updated);
    };

    return (
        <div className="min-h-screen flex flex-col items-center">
            <div className="w-2/3 mt-10 mb-6">
                <h1 className="text-2xl font-bold mb-2">Import Your Transactions</h1>
                <p className="text-gray-600">Easily import your CSV files, map your data, and review your transactions below. Get started by importing your CSV files!</p>
            </div>
            <ImportSteps />
            <DataMapping unmappedSchemas={unmappedSchemas} onSaveMapping={handleSaveMapping}/>
            <div className={"w-2/3 mt-10 gap-4 flex flex-col"}>
                <CSVImport onFileImport={handleFileImport}/>
                <CSVFileList csvSchemas={csvSchemas} onReset={handleRemoveMapping} onRemove={handleDelete}/>
            </div>
            {/* Separation line and section for transactions table */}
            <div className="w-full flex justify-center my-10">
                <div className="w-2/3 border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className={"m-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-10"}>
                {transactions.length > 0 && (
                    <>
                        <p className="font-semibold mb-2">All transactions</p>
                        <TransactionTable compact transactions={transactions}/>
                    </>
                )}
            </div>
        </div>
    );
};

export default ImportPage;
