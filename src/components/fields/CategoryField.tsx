import React, {useState} from 'react';
import {Category, Transaction, TransactionID} from '@/model';
import {useGlobalContext} from "@/context/GlobalContext";
import {useTransactionsContext} from "@/context/TransactionsContext";
import BackdropBlur from '@/components/BackdropBlur';
import TransactionSelectTable from './TransactionSelectTable';

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

    const confirmChange = (selectedIds: TransactionID[]) => {
        if (pendingCategory) {
            // Find selected transactions
            const allTxs = [transaction, ...likeTransactions];
            const selectedTxs = allTxs.filter(t => selectedIds.includes(t.id));
            setCategory(selectedTxs, pendingCategory);
        }
        setShowDialog(false);
        setPendingCategory(null);
        setLikeTransactions([]);
        setInputValue('');
        setShowDropdown(false);
    };

    const cancelChange = () => {
        setShowDialog(false);
        setPendingCategory(null);
        setLikeTransactions([]);
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
                                + Add &quot;{inputValue.trim()}&quot;
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Warning if input value doesn't match any category or if category is Unassigned and input is not empty */}
            {(inputValue.trim() && !categories.includes(inputValue.trim())) || (inputValue.trim() && transaction.category === 'Unassigned') ? (
                <div className="mt-1 text-xs text-yellow-400">
                    {inputValue.trim() && !categories.includes(inputValue.trim()) && (
                        <>Warning: &quot;{inputValue.trim()}&quot; is not an existing category.<br/></>
                    )}
                    {inputValue.trim() && transaction.category === 'Unassigned' && (
                        <>Warning: This transaction is currently <b>Unassigned</b>. Please select or add a category.</>
                    )}
                </div>
            ) : null}
            {showDialog && (
                <CategoryAssignConfirmDialog
                    pendingCategory={pendingCategory}
                    transaction={transaction}
                    likeTransactions={likeTransactions}
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
    confirmChange: (selectedIds: TransactionID[]) => void;
    cancelChange: () => void;
}

const CategoryAssignConfirmDialog: React.FC<CategoryAssignConfirmDialogProps> = ({
    pendingCategory,
    transaction,
    likeTransactions,
    confirmChange,
    cancelChange
}) => {
    const allTransactions = [transaction, ...likeTransactions];
    const initialSelectedIds = allTransactions.map(t => t.id);

    return (
        <BackdropBlur>
            <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg flex flex-col items-center gap-4 max-w-lg w-full">
                <div>Are you sure you want to assign the category <b>{pendingCategory}</b> to the selected transactions?</div>
                <TransactionSelectTable
                    transactions={allTransactions}
                    initialSelectedIds={initialSelectedIds}
                    onConfirm={confirmChange}
                    onCancel={cancelChange}
                />
            </div>
        </BackdropBlur>
    );
};
