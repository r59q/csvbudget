import {Category, MappedCSVRow, RowCategoryMap} from "@/model";
import {useEffect, useState} from "react";
import {getCategoryData, getRowCategoryData} from "@/data";

const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [rowCategoryMap, setRowCategoryMap] = useState<RowCategoryMap>({});

    useEffect(() => {
        const categoriesData = getCategoryData();
        const rowCategoryMapData = getRowCategoryData();
        setCategories(categoriesData.load());
        setRowCategoryMap(rowCategoryMapData.load());
    }, []);

    const saveCategories = (categories: Category[]) => {
        const value = Array.from(new Set(categories));
        setCategories(getCategoryData().save(value));
    }

    const saveRowCategories = (updatedMap: RowCategoryMap) => {
        setRowCategoryMap(getRowCategoryData().save(updatedMap));
    }

    const getCategory = (row: MappedCSVRow): Category | undefined => {
        const mappedValue = rowCategoryMap[row.mappedId];
        if (mappedValue === "") {
            return undefined;
        }
        return mappedValue;
    }

    const groupByCategory = (rows: MappedCSVRow[]): Partial<Record<Category, MappedCSVRow[]>> => {
        return Object.groupBy(rows, row => {
            return getCategory(row) ?? "Unassigned";
        })
    }

    return {
        rowCategoryMap,
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
                Object.entries(rowCategoryMap).filter(([_, value]) => value !== category)
            );
            saveRowCategories(updatedMap);
        },
        setCategory: (rows: MappedCSVRow | MappedCSVRow[], category: Category | undefined) => {
            const updatedMap: RowCategoryMap = {...rowCategoryMap};
            if (Array.isArray(rows)) {
                rows.forEach(row => {
                    if (!category || category === "") {
                        delete updatedMap[row.mappedId];
                    } else {
                        updatedMap[row.mappedId] = category;
                    }
                })

            } else {
                if (!category || category === "") {
                    delete updatedMap[rows.mappedId];
                } else {
                    updatedMap[rows.mappedId] = category;
                }
            }
            saveRowCategories(updatedMap)
        }
    }
};

export default useCategories;