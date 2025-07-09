import {useEffect, useState} from "react";
import {CSVFile, RawCSV} from "@/model";
import {getCSVFilesData} from "@/data";
import {getHeadersFromRawFile, mapRawCSVToCSVFile} from "@/utility/csvutils";

const useCSVFiles = () => {
    const [csvFiles, setCSVFiles] = useState<CSVFile[]>([]);

    useEffect(() => {
        const stored = getCSVFilesData().load();
        setCSVFiles(stored.map(raw => mapRawCSVToCSVFile(raw)));
    }, []);

    const mapCSVFileToRaw = (file: CSVFile): RawCSV => {
        return {
            name: file.name,
            content: file.getContent()
        };
    }

    const saveCSVFiles = (files: CSVFile[]) => {
        setCSVFiles(getCSVFilesData().save(files.map(file => mapCSVFileToRaw(file))).map(raw => mapRawCSVToCSVFile(raw)));
    };

    return {csvFiles, setCSVFiles: saveCSVFiles};
};

export default useCSVFiles;

