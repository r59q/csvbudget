import React, {useState} from 'react';
import {CSVFile} from "@/model";
import DataMapping from "@/features/mapping/DataMapping";
import {useGlobalContext} from "@/context/GlobalContext";
import CSVImport from "@/features/import/CSVImport";
import CSVFileList from "@/features/import/CSVFileList";
import ImportSteps from "@/features/import/ImportSteps";
import TransactionsSection from "@/features/import/TransactionsSection";
import {LinkButton} from "@/components/LinkButton";
import {fileImportEventHandler} from "@/utility/csvutils";

const ImportPage = () => {
    const {csvFiles, setCSVFiles, unmappedSchemas, handleSaveMapping, handleRemoveMapping} = useGlobalContext();
    const [initialImport, setInitialImport] = useState(false); // TODO: Will be defaulted to false

    const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement> | FileList) => {
        const imported = await fileImportEventHandler(e) ?? [];
        const updated = [
            ...csvFiles.filter(
                (existing) => !imported.some((nf) => nf.name === existing.name)
            ),
            ...imported,
        ];

        setCSVFiles(updated);
        setInitialImport(true);
    }
    const handleDeleteFile = (fileName: CSVFile['name']) => {
        const updated = csvFiles.filter((file) => file.name !== fileName);
        setCSVFiles(updated);
    };

    return (
        <div className="min-h-screen flex flex-col items-center gap-4 bg-gradient-to-b from-gray-950 to-[#0a0a0a]">
            {/* Data mapping is a popup that will be used to map data */}
            <DataMapping unmappedSchemas={unmappedSchemas} isInitialImport={initialImport}
                         onSaveMapping={handleSaveMapping} onCloseInitialImport={() => setInitialImport(false)}/>

            <div className="w-2/3 mt-10 mb-6">
                <h1 className="text-2xl font-bold mb-2">Import Your Transactions</h1>
                <p className="text-gray-500">Easily import your CSV files, map your data, and review your transactions
                    below. Get started by importing your CSV files!</p>
            </div>
            <ImportSteps/>


            <div className={"w-2/3 mt-10 gap-4 flex flex-col"}>
                <CSVImport onFileImport={handleFileImport}/>
                <CSVFileList csvFiles={csvFiles} onReset={handleRemoveMapping} onRemove={handleDeleteFile}/>
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
                <div className="w-2/3 border-t border-gray-700"></div>
            </div>
            <div className={"px-4 w-full"}>
                <TransactionsSection/>
            </div>

        </div>
    );
};

export default ImportPage;
