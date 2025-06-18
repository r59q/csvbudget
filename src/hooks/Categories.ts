import {Category, Transaction, TransactionCategoryMap, TransactionID} from "@/model";
import {useCallback, useEffect, useState} from "react";
import {getCategoryData, getCategoryMapdData} from "@/data";

export interface UseCategoriesResult {
    categoryMap: TransactionCategoryMap;
    categories: Category[];
    getCategory: (id: TransactionID) => Category;
    groupByCategory: (transactions: Transaction[]) => Partial<Record<Category, Transaction[]>>;
    createCategory: (category: Category) => void;
    deleteCategory: (category: Category) => void;
    setCategory: (transactions: Transaction | Transaction[], category: Category | undefined) => void;
}

const useCategories = (): UseCategoriesResult => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryMap, setCategoryMap] = useState<TransactionCategoryMap>({});

    useEffect(() => {
        const categoriesData = getCategoryData();
        const rowCategoryMapData = getCategoryMapdData();
        setCategories(categoriesData.load());
        setCategoryMap(rowCategoryMapData.load());
    }, []);

    const saveCategories = (categories: Category[]) => {
        const value = Array.from(new Set(categories));
        setCategories(getCategoryData().save(value));
    }

    const saveCategoryMap = (updatedMap: TransactionCategoryMap) => {
        setCategoryMap(getCategoryMapdData().save(updatedMap));
    }

    const getCategory = useCallback((id: TransactionID): Category => {
        const mappedValue = categoryMap[String(id)];
        if ((mappedValue ?? "") === "") {
            return "Unassigned"
        }
        return mappedValue;
    }, [categoryMap]);

    const groupByCategory = (transactions: Transaction[]): Partial<Record<Category, Transaction[]>> => {
        return Object.groupBy(transactions, transaction => {
            return getCategory(transaction.id);
        })
    }

    return {
        categoryMap,
        categories,
        getCategory,
        groupByCategory,
        createCategory: (category: Category) => {
            saveCategories([...categories, category.trim()])
        },
        deleteCategory: (category: Category) => {
            saveCategories([...categories].filter(e => e !== category.trim()))
            // Remove all mappings to this category
            const updatedMap = Object.fromEntries(
                Object.entries(categoryMap).filter(([_, value]) => value !== category)
            );
            saveCategoryMap(updatedMap);
        },
        setCategory: (transactions: Transaction | Transaction[], category: Category | undefined) => {
            const updatedMap: TransactionCategoryMap = {...categoryMap};
            if (Array.isArray(transactions)) {
                transactions.forEach(tx => {
                    if (!category || category === "") {
                        delete updatedMap[String(tx.id)];
                    } else {
                        updatedMap[String(tx.id)] = category;
                    }
                })
            } else {
                if (!category || category === "") {
                    delete updatedMap[String(transactions.id)];
                } else {
                    updatedMap[String(transactions.id)] = category;
                }
            }
            saveCategoryMap(updatedMap);
        }
    }
};

export default useCategories;