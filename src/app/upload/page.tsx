'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";

type CsvFile = { name: string; content: string };

export default function CsvUploader() {
    const [uploadedFiles, setUploadedFiles] = useState<CsvFile[]>([]);

    // Load existing CSVs from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('budget_csv_files');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setUploadedFiles(parsed);
                }
            } catch (e) {
                console.error('Error parsing stored CSVs:', e);
            }
        }
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const fileDataPromises = files.map((file) => {
            return new Promise<CsvFile>((resolve, reject) => {
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
                ...uploadedFiles.filter(
                    (existing) => !newFiles.some((nf) => nf.name === existing.name)
                ),
                ...newFiles,
            ];

            localStorage.setItem('budget_csv_files', JSON.stringify(updated));
            setUploadedFiles(updated);
        });
    };

    const handleDelete = (fileName: string) => {
        const updated = uploadedFiles.filter((file) => file.name !== fileName);
        localStorage.setItem('budget_csv_files', JSON.stringify(updated));
        setUploadedFiles(updated);
    };

    return (
        <div className={"w-full max-w-md mx-auto mt-10 gap-4 flex flex-col"}>
            <div className="p-4 rounded-lg border border-gray-300">
                <h2 className="text-xl font-semibold mb-4">Upload Budget CSVs</h2>
                <input
                    type="file"
                    accept=".csv"
                    multiple
                    onChange={handleFileUpload}
                    className="mb-4"
                />

                {uploadedFiles.length > 0 ? (
                    <ul className="space-y-2 text-sm text-gray-800">
                        {uploadedFiles.map((file, idx) => (
                            <li
                                key={idx}
                                className="flex items-center justify-between p-2 bg-gray-100 rounded"
                            >
                                <span>{file.name}</span>
                                <button
                                    onClick={() => handleDelete(file.name)}
                                    className="text-red-500 hover:text-red-700 text-xs"
                                >
                                    🗑️ Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500">No CSVs uploaded yet.</p>
                )}
            </div>
            <div className={"pl-4"}>
                <Link href={"/mapping"} className={"underline"}>Next: Map data</Link>
            </div>
        </div>
    );
}

