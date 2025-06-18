import React, {useState} from 'react';
import {Category, Transaction} from '@/model';
import {useGlobalContext} from "@/context/GlobalContext";
import useTransactions from "@/hooks/Transactions";
import {useTransactionsContext} from "@/context/TransactionsContext";

interface CategoryFieldProps {
    transaction: Transaction;
}

const CategoryField: React.FC<CategoryFieldProps> = ({transaction}) => {
    const {categories, setCategory, deleteCategory, createCategory} = useGlobalContext();
    const {getUncategorizedTransactionsLike} = useTransactionsContext()
    const [inputValue, setInputValue] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const handleCategoryChange = (category: Category) => {
        setCategory(transaction, category);
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


    const handleAddCategory = () => {
        if (inputValue.trim() && !categories.includes(inputValue.trim())) {
            createCategory(inputValue.trim());
            setCategory(transaction, inputValue.trim());
        }
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
        <div className="relative w-full">
            <input
                className="p-1 border w-full bg-gray-900 text-white rounded"
                value={inputValue !== '' ? inputValue : (transaction.category === 'Unassigned' ? '' : transaction.category || '')}
                onChange={handleInputChange}
                onFocus={() => setShowDropdown(true)}
                onBlur={handleInputBlur}
                placeholder="Add or select category"
                list="category-list"
            />
            {showDropdown && (
                <div
                    className="absolute z-10 w-full bg-gray-900 border border-gray-700 rounded shadow max-h-48 overflow-y-auto">
                    {categories.length === 0 && (
                        <div className="p-2 text-gray-400">No categories</div>
                    )}
                    {categories.map(opt => {
                        return (
                            <div key={opt}
                                 className="flex items-center justify-between px-2 py-1 hover:bg-gray-800 cursor-pointer">
                                <span className={"flex flex-grow"} onClick={() => handleCategoryChange(opt)}>{opt}</span>
                                <button
                                    className="ml-2 text-xs text-red-400 hover:text-red-600"
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleDeleteCategory(opt);
                                    }}
                                    title="Delete category"
                                >
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
    );
};

export default CategoryField;


