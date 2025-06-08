
const ADVANCED_FILTER_KEY = "advanced_filters";
export type CsvRowId = number;
export type RowCategoryMap = Record<CsvRowId, string>; // key: JSON.stringify(row)

export const saveCategories = (cats: string[]) => {
    const sorted = [...new Set(cats)].sort();
    localStorage.setItem('categories', JSON.stringify(sorted));
    return sorted;
};

export const loadAdvancedFilters = (): string[] => {
    return JSON.parse(localStorage.getItem(ADVANCED_FILTER_KEY) ?? "[]")
}

export const saveAdvancedFilters = (filters: string[]): string[] => {
    localStorage.setItem(ADVANCED_FILTER_KEY, JSON.stringify(filters));
    return filters;
}

export const formatCurrency = (amount: number) =>
    amount.toLocaleString("da-DK", {
        style: "currency",
        currency: "DKK",
        minimumFractionDigits: 2,
    });

