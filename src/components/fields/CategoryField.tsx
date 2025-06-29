import React, {useState} from 'react';
import {Category, Transaction, TransactionID} from '@/model';
import {useGlobalContext} from "@/context/GlobalContext";
import {useTransactionsContext} from "@/context/TransactionsContext";
import BackdropBlur from '@/components/BackdropBlur';

interface CategoryFieldProps {
    transaction: Transaction;
}

const CategoryField: React.FC<CategoryFieldProps> = ({transaction}) => {
    const {categories, setCategory, deleteCategory, createCategory} = useGlobalContext();
    const {getUncategorizedExpenseTransactionsLike} = useTransactionsContext()
    const [inputValue, setInputValue] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [pendingCategory, setPendingCategory] = useState<Category | null>(null);
    const [likeTransactions, setLikeTransactions] = useState<Transaction[]>([]);
    const [selectedIds, setSelectedIds] = useState<TransactionID[]>([]);

    // Helper to open confirmation dialog
    const openCategoryDialog = (category: Category) => {
        const similarUncategorized = getUncategorizedExpenseTransactionsLike(transaction);
        const allIds = [transaction.id, ...similarUncategorized.map(t => t.id)];
        if (allIds.length === 1) {
            // No similar transactions, assign directly
            setCategory(transaction, category);
            setInputValue('');
            setShowDropdown(false);
            return;
        }
        setPendingCategory(category);
        setLikeTransactions(similarUncategorized);
        setSelectedIds(allIds); // default: all selected
        setShowDialog(true);
    };

    const handleCategoryChange = (category: Category) => {
        openCategoryDialog(category);
    };

    const handleAddCategory = () => {
        if (inputValue.trim() && !categories.includes(inputValue.trim())) {
            createCategory(inputValue.trim());
            openCategoryDialog(inputValue.trim());
        }
        setInputValue('');
        setShowDropdown(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setShowDropdown(true);
        // Only set to Unassigned if the user clears the input AND the field was previously not empty
        if (value === '' && transaction.category !== 'Unassigned') {
            setCategory(transaction, 'Unassigned');
        }
    };

    const handleInputBlur = () => {
        setTimeout(() => setShowDropdown(false), 150); // allow click events to register
    };

    const toggleSelect = (id: TransactionID) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const confirmChange = () => {
        if (pendingCategory) {
            // Find selected transactions
            const allTxs = [transaction, ...likeTransactions];
            const selectedTxs = allTxs.filter(t => selectedIds.includes(t.id));
            setCategory(selectedTxs, pendingCategory);
        }
        setShowDialog(false);
        setPendingCategory(null);
        setLikeTransactions([]);
        setSelectedIds([]);
        setInputValue('');
        setShowDropdown(false);
    };

    const cancelChange = () => {
        setShowDialog(false);
        setPendingCategory(null);
        setLikeTransactions([]);
        setSelectedIds([]);
        setInputValue('');
        setShowDropdown(false);
    };

    const handleDeleteCategory = (cat: Category) => {
        deleteCategory(cat);
        if (transaction.category === cat) {
            setCategory(transaction, 'Unassigned');
        }
    };

    return (
        <>
            <div className="relative w-full flex flex-row">
                <input
                    className="p-1 border w-full bg-gray-900 text-white rounded flex-1"
                    value={inputValue !== '' ? inputValue : (transaction.category === 'Unassigned' ? '' : transaction.category || '')}
                    onChange={handleInputChange}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={handleInputBlur}
                    placeholder="Add or select category"
                    list="category-list"
                />

                {transaction.category === 'Unassigned' && transaction.guessedCategory !== "Unassigned" && (
                    <button
                        className="flex-1 ml-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        onClick={() => openCategoryDialog(transaction.guessedCategory)}
                        title={`Assign category '${transaction.guessedCategory}'`}
                    >
                        {transaction.guessedCategory}
                    </button>
                )}

                {showDropdown && (
                    <div
                        className="absolute top-10 z-10 w-full bg-gray-900 border border-gray-700 rounded shadow max-h-80 overflow-y-auto">
                        {categories.length === 0 && (
                            <div className="p-2 text-gray-400">No categories</div>
                        )}
                        {categories.map(opt => {
                            return (
                                <div key={opt}
                                     className="flex items-center justify-between px-2 py-1 hover:bg-gray-800 cursor-pointer">
                                    <span className={"flex flex-grow"}
                                          onClick={() => handleCategoryChange(opt)}>{opt}</span>
                                    <button
                                        className="ml-2 text-xs text-red-400 hover:text-red-600"
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleDeleteCategory(opt);
                                        }}
                                        title="Delete category">
                                        ✕
                                    </button>
                                </div>
                            )
                        })}
                        {inputValue.trim() && !categories.includes(inputValue.trim()) && (
                            <div className="px-2 py-1 text-blue-400 hover:bg-gray-800 cursor-pointer"
                                 onClick={handleAddCategory}>
                                + Add "{inputValue.trim()}"
                            </div>
                        )}
                    </div>
                )}
            </div>
            {showDialog && (
                <CategoryAssignConfirmDialog
                    pendingCategory={pendingCategory}
                    transaction={transaction}
                    likeTransactions={likeTransactions}
                    selectedIds={selectedIds}
                    toggleSelect={toggleSelect}
                    confirmChange={confirmChange}
                    cancelChange={cancelChange}
                />
            )}
        </>
    );
};

export default CategoryField;

// Dialog component
interface CategoryAssignConfirmDialogProps {
    pendingCategory: Category | null;
    transaction: Transaction;
    likeTransactions: Transaction[];
    selectedIds: TransactionID[];
    toggleSelect: (id: TransactionID) => void;
    confirmChange: () => void;
    cancelChange: () => void;
}

const CategoryAssignConfirmDialog: React.FC<CategoryAssignConfirmDialogProps> = ({
                                                                                     pendingCategory,
                                                                                     transaction,
                                                                                     likeTransactions,
                                                                                     selectedIds,
                                                                                     toggleSelect,
                                                                                     confirmChange,
                                                                                     cancelChange
                                                                                 }) => (
    <BackdropBlur>
        <div
            className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg flex flex-col items-center gap-4 max-w-lg w-full">
            <div>Are you sure you want to assign the category <b>{pendingCategory}</b> to the selected transactions?
            </div>
            <div className="max-h-90 overflow-y-auto w-full">
                <table className="w-full text-xs border select-none border-gray-800 bg-gray-900 rounded">
                    <thead>
                    <tr className="bg-gray-800">
                        <th className="p-1 border">Select</th>
                        <th className="p-1 border">ID</th>
                        <th className="p-1 border">Date</th>
                        <th className="p-1 border">Text</th>
                        <th className="p-1 border">Amount</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr
                        onClick={() => toggleSelect(transaction.id)}
                        className="cursor-pointer hover:bg-gray-700"
                    >
                        <td className="p-1 border text-center" onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={selectedIds.includes(transaction.id)}
                                   onChange={() => toggleSelect(transaction.id)}/>
                        </td>
                        <td className="p-1 border">{transaction.id}</td>
                        <td className="p-1 border">{transaction.date.format("YYYY-MM-DD")}</td>
                        <td className="p-1 border">{transaction.text}</td>
                        <td className="p-1 border">{transaction.amount}</td>
                    </tr>
                    {likeTransactions.map(t => (
                        <tr key={t.id}
                            onClick={() => toggleSelect(t.id)}
                            className="even:bg-gray-800 cursor-pointer hover:bg-gray-700"
                        >
                            <td className="p-1 border text-center" onClick={e => e.stopPropagation()}>
                                <input type="checkbox" checked={selectedIds.includes(t.id)}
                                       onChange={() => toggleSelect(t.id)}/>
                            </td>
                            <td className="p-1 border">{t.id}</td>
                            <td className="p-1 border">{t.date.format("YYYY-MM-DD")}</td>
                            <td className="p-1 border">{t.text}</td>
                            <td className="p-1 border">{t.amount}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="flex gap-2 mt-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={confirmChange}
                        disabled={selectedIds.length === 0}>Confirm
                </button>
                <button className="px-4 py-2 bg-gray-400 text-black rounded" onClick={cancelChange}>Cancel</button>
            </div>
        </div>
    </BackdropBlur>
);
