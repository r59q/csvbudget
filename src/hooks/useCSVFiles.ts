import { useEffect, useState } from "react";
import { CSVFile } from "@/model";
import { getCSVFilesData } from "@/data";

const useCSVFiles = () => {
  const [csvFiles, setCSVFiles] = useState<CSVFile[]>([]);

  useEffect(() => {
    const stored = getCSVFilesData().load();
    setCSVFiles(stored);
  }, []);

  const saveCSVFiles = (files: CSVFile[]) => {
    setCSVFiles(getCSVFilesData().save(files));
  };

  return { csvFiles, setCSVFiles: saveCSVFiles };
};

export default useCSVFiles;

