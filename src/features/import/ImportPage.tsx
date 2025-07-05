import React from 'react';
import {CSVFile} from "@/model";
import DataMapping from "@/features/mapping/DataMapping";
import {useGlobalContext} from "@/context/GlobalContext";
import useCSVRows from "@/hooks/CSVRows";
import {useTransactionsContext} from "@/context/TransactionsContext";
import CSVImport from "@/features/import/CSVImport";
import FileSchemasList from "@/features/import/FileSchemasList";
import TransactionTable from "@/features/transaction/TransactionTable";

const ImportPage = () => {
    const {csvFiles, setCSVFiles, unmappedSchemas, handleSaveMapping, handleRemoveMapping} = useGlobalContext();
    const {transactions} = useTransactionsContext();
    const {csvSchemas} = useCSVRows();

    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
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
        <div className="min-h-screen flex flex-col">
            <DataMapping unmappedSchemas={unmappedSchemas} onSaveMapping={handleSaveMapping}/>
            <div className={"w-full max-w-md mx-auto mt-10 gap-4 flex flex-col"}>
                <CSVImport
                    csvFiles={csvFiles}
                    onFileImport={handleFileImport}
                    onDelete={handleDelete}
                />
                <FileSchemasList csvSchemas={csvSchemas} onReset={handleRemoveMapping}/>
            </div>
            <div className={"p-4"}>
                <p>All transactions</p>
                <TransactionTable transactions={transactions}/>
            </div>
        </div>
    );
};

export default ImportPage;

