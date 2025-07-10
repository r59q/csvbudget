import React, { useState } from 'react';
import { Transaction, TransactionID } from '@/model';

export interface TransactionSelectTableAdditionalColumn {
    title: string;
    cell: (transaction: Transaction) => React.ReactNode;
}

interface TransactionSelectTableProps {
    transactions: Transaction[];
    initialSelectedIds?: TransactionID[];
    onConfirm: (selected: TransactionID[]) => void;
    onCancel: () => void;
    additionalColumns?: TransactionSelectTableAdditionalColumn[];
}

const TransactionSelectTable: React.FC<TransactionSelectTableProps> = ({
    transactions,
    initialSelectedIds = [],
    onConfirm,
    onCancel,
    additionalColumns = [],
}) => {
    const [selectedIds, setSelectedIds] = useState<TransactionID[]>(initialSelectedIds);

    const toggleSelect = (id: TransactionID) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleConfirm = () => {
        const selectedTxs = transactions.filter(t => selectedIds.includes(t.id));
        onConfirm(selectedTxs.map(e => e.id));
    };

    return (
        <div className="w-full">
            <div className="max-h-90 overflow-y-auto w-full">
                <table className="w-full text-xs border select-none border-gray-800 bg-gray-900 rounded">
                    <thead>
                    <tr className="bg-gray-800">
                        <th className="p-1 border">Select</th>
                        <th className="p-1 border">ID</th>
                        <th className="p-1 border">Date</th>
                        <th className="p-1 border">Text</th>
                        <th className="p-1 border">Amount</th>
                        {additionalColumns.map((col, idx) => (
                            <th className="p-1 border" key={col.title + idx}>{col.title}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {transactions.map(t => (
                        <tr key={t.id}
                            onClick={() => toggleSelect(t.id)}
                            className="cursor-pointer hover:bg-gray-700 even:bg-gray-800"
                        >
                            <td className="p-1 border text-center" onClick={e => e.stopPropagation()}>
                                <input type="checkbox" checked={selectedIds.includes(t.id)}
                                       onChange={() => toggleSelect(t.id)} />
                            </td>
                            <td className="p-1 border">{t.id}</td>
                            <td className="p-1 border">{t.date.format("YYYY-MM-DD")}</td>
                            <td className="p-1 border">{t.text}</td>
                            <td className="p-1 border">{t.amount}</td>
                            {additionalColumns.map((col, idx) => (
                                <td className="p-1 border" key={col.title + idx + t.id}>{col.cell(t)}</td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="flex gap-2 justify-end mt-4">
                <button className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600" onClick={onCancel}>Cancel</button>
                <button className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={handleConfirm}>Confirm</button>
            </div>
        </div>
    );
};

export default TransactionSelectTable;
