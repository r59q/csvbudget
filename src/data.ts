import {AccountMappings, AccountNumber, Category, CSVFile, RowCategoryMap, RowIncomeMap} from "@/model";

interface StoredDataWrapper<T> {
    load: () => T;
    save: (value: T) => T;
}

const CSV_FILES_KEY = 'budget_csv_files';
const ACCOUNT_MAPPINGS_KEY = 'account_mappings';
const OWNED_ACCOUNTS_KEY = 'own_accounts';
const ADVANCED_FILTERS_KEY = "advanced_filters"
const CATEGORIES_KEY = "categories"
const ROW_CATEGORY_MAP_KEY = "row_category_map"
const ROW_INCOME_MAP_KEY = "row_income_map"


export const getCSVFilesData = (): StoredDataWrapper<CSVFile[]> => {
    return {
        load: () => {
            const raw = localStorage.getItem(CSV_FILES_KEY);
            if (!raw) return [];

            let parsedFiles: CSVFile[];
            try {
                parsedFiles = JSON.parse(raw);
                if (!Array.isArray(parsedFiles)) return [];
            } catch {
                return [];
            }
            return parsedFiles;
        },
        save: (files: CSVFile[]) => {
            try {
                localStorage.setItem(CSV_FILES_KEY, JSON.stringify(files));
            } catch {
                return [];
            }
            return files;
        }
    }
}

export const getAccountMappingData = (): StoredDataWrapper<AccountMappings> => {
    return {
        load: () => {
            const mappings = localStorage.getItem(ACCOUNT_MAPPINGS_KEY) ?? "{}";
            return JSON.parse(mappings);
        },
        save: (mappings: AccountMappings) => {
            try {
                localStorage.setItem(ACCOUNT_MAPPINGS_KEY, JSON.stringify(mappings))
            } catch (e) {
                console.error(e);
                return {}
            }
            return mappings;
        }
    }
}

export const getOwnedAccountsData = (): StoredDataWrapper<AccountNumber[]> => {
    return {
        load: () => {
            const loaded = localStorage.getItem(OWNED_ACCOUNTS_KEY) ?? "[]";
            return JSON.parse(loaded);
        },
        save: (accountNumbers: AccountNumber[]) => {
            try {
                localStorage.setItem(OWNED_ACCOUNTS_KEY, JSON.stringify(accountNumbers));
            } catch (e) {
                console.error(e);
                return []
            }
            return accountNumbers;
        }
    }
}

export const getAdvancedFiltersData = (): StoredDataWrapper<string[]> => {
    return {
        load: () => {
            const loaded = localStorage.getItem(ADVANCED_FILTERS_KEY) ?? "[]";
            return JSON.parse(loaded);
        },
        save: value => {
            try {
                localStorage.setItem(ADVANCED_FILTERS_KEY, JSON.stringify(value));
            } catch (e) {
                console.error(e);
                return []
            }
            return value;
        }
    }
}

export const getCategoryData = (): StoredDataWrapper<Category[]> => {
    return {
        load: () => {
            const loaded = localStorage.getItem(CATEGORIES_KEY) ?? "[]";
            return JSON.parse(loaded)
        },
        save: categories => {
            try {
                localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
            } catch (e) {
                console.error(e);
                return []
            }
            return categories;
        }
    };
}
export const getRowCategoryData = (): StoredDataWrapper<RowCategoryMap> => {
    return {
        load: () => {
            const loaded = localStorage.getItem(ROW_CATEGORY_MAP_KEY) ?? "{}";
            return JSON.parse(loaded)
        },
        save: rowCategories => {
            try {
                localStorage.setItem(ROW_CATEGORY_MAP_KEY, JSON.stringify(rowCategories));
            } catch (e) {
                console.error(e);
                return []
            }
            return rowCategories;
        }
    };
}
export const getRowIncomeData = (): StoredDataWrapper<RowIncomeMap> => {
    return {
        load: () => {
            const loaded = localStorage.getItem(ROW_INCOME_MAP_KEY) ?? "{}";
            return JSON.parse(loaded)
        },
        save: rowIncome => {
            try {
                localStorage.setItem(ROW_INCOME_MAP_KEY, JSON.stringify(rowIncome));
            } catch (e) {
                console.error(e);
                return []
            }
            return rowIncome;
        }
    };
}