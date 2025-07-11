import {
    AccountMappings,
    AccountNumber,
    BudgetPost,
    Category,
    CategoryBudgetPostMap,
    Envelope,
    EnvelopeMap,
    RawCSV,
    TransactionCategoryMap,
    TransactionID,
    TransactionLinkDescriptor,
    TransactionType
} from "@/model";
import {SchemaColumnMapping} from "@/utility/csvutils";

interface StoredDataWrapper<T> {
    load: () => T;
    save: (value: T) => T;
}

const CSV_FILES_KEY = 'budget_csv_files';
const ACCOUNT_MAPPINGS_KEY = 'account_mappings';
const OWNED_ACCOUNTS_KEY = 'own_accounts';
const ADVANCED_FILTERS_KEY = "advanced_filters"
const CATEGORIES_KEY = "categories"
const ROW_CATEGORY_MAP_KEY = "transaction_category_map"
const ROW_INCOME_MAP_KEY = "transaction_income_map"
const BUDGET_POST_KEY = "budget_posts"
const CATEGORY_BUDGET_MAP_KEY = "category_budgetpost_map";
const CSV_MAPPING_KEY = "csv_mappings";
const TRANSACTION_LINKS_KEY = "transaction_links";
const TRANSACTION_TYPE_MAP_KEY = "transaction_type_map";
const SELECTED_ENVELOPES_KEY = "selected_envelopes";
const CURRENCY_KEY = "currency";

/// Used for resetting data
export const LOCALSTORAGE_KEYS = [
    CSV_FILES_KEY,
    ACCOUNT_MAPPINGS_KEY,
    OWNED_ACCOUNTS_KEY,
    ADVANCED_FILTERS_KEY,
    CATEGORIES_KEY,
    ROW_CATEGORY_MAP_KEY,
    ROW_INCOME_MAP_KEY,
    BUDGET_POST_KEY,
    CATEGORY_BUDGET_MAP_KEY,
    CSV_MAPPING_KEY,
    TRANSACTION_LINKS_KEY,
    TRANSACTION_TYPE_MAP_KEY,
    SELECTED_ENVELOPES_KEY,
    CURRENCY_KEY,
];

export const getCSVFilesData = (): StoredDataWrapper<RawCSV[]> => {
    return {
        load: () => {
            const raw = localStorage.getItem(CSV_FILES_KEY);
            if (!raw) return [];

            let parsedFiles: RawCSV[];
            try {
                parsedFiles = JSON.parse(raw);
                if (!Array.isArray(parsedFiles)) return [];
            } catch {
                return [];
            }
            return parsedFiles;
        },
        save: (files: RawCSV[]) => {
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
export const getCategoryMapdData = (): StoredDataWrapper<TransactionCategoryMap> => {
    return {
        load: () => {
            const loaded = localStorage.getItem(ROW_CATEGORY_MAP_KEY) ?? "{}";
            return JSON.parse(loaded)
        },
        save: (rowCategories: TransactionCategoryMap) => {
            try {
                localStorage.setItem(ROW_CATEGORY_MAP_KEY, JSON.stringify(rowCategories));
            } catch (e) {
                console.error(e);
                return {}
            }
            return rowCategories;
        }
    };
}

export const getRowIncomeData = (): StoredDataWrapper<EnvelopeMap> => {
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

export const getBudgetPostData = (): StoredDataWrapper<BudgetPost[]> => {
    return {
        load: () => {
            const loaded = localStorage.getItem(BUDGET_POST_KEY) ?? "[]";
            return JSON.parse(loaded)
        },
        save: budgetPosts => {
            try {
                localStorage.setItem(BUDGET_POST_KEY, JSON.stringify(budgetPosts));
            } catch (e) {
                console.error(e);
                return []
            }
            return budgetPosts;
        }
    };
}

export const getCategoryBudgetMapData = (): StoredDataWrapper<CategoryBudgetPostMap> => {
    return {
        load: () => {
            const loaded = localStorage.getItem(CATEGORY_BUDGET_MAP_KEY) ?? "{}";
            return JSON.parse(loaded)
        },
        save: (mapping: CategoryBudgetPostMap) => {
            try {
                localStorage.setItem(CATEGORY_BUDGET_MAP_KEY, JSON.stringify(mapping));
            } catch (e) {
                console.error(e);
                return {}
            }
            return mapping;
        }
    };
}

export const getCSVMappingData = (): StoredDataWrapper<SchemaColumnMapping> => {
    return {
        load: () => {
            const loaded = localStorage.getItem(CSV_MAPPING_KEY) ?? "{}";
            return JSON.parse(loaded)
        },
        save: (mapping: SchemaColumnMapping) => {
            try {
                localStorage.setItem(CSV_MAPPING_KEY, JSON.stringify(mapping));
            } catch (e) {
                console.error(e);
                return {}
            }
            return mapping;
        }
    };
}

export const getTransactionLinksData = (): StoredDataWrapper<Record<TransactionID, TransactionLinkDescriptor[]>> => {
    return {
        load: () => {
            const loaded = localStorage.getItem(TRANSACTION_LINKS_KEY) ?? "{}";
            return JSON.parse(loaded);
        },
        save: (links: Record<number, TransactionLinkDescriptor[]>) => {
            try {
                localStorage.setItem(TRANSACTION_LINKS_KEY, JSON.stringify(links));
            } catch (e) {
                console.error(e);
                return {};
            }
            return links;
        }
    };
}

export const getTransactionTypeMapData = (): StoredDataWrapper<Record<TransactionID, TransactionType>> => {
    return {
        load: () => {
            const loaded = localStorage.getItem(TRANSACTION_TYPE_MAP_KEY) ?? '{}';
            return JSON.parse(loaded);
        },
        save: (typeMap: Record<TransactionID, TransactionType>) => {
            try {
                localStorage.setItem(TRANSACTION_TYPE_MAP_KEY, JSON.stringify(typeMap));
            } catch (e) {
                console.error(e);
                return {};
            }
            return typeMap;
        }
    };
}

export const getSelectedEnvelopesData = (): StoredDataWrapper<Envelope[]> => {
    return {
        load: () => {
            const raw = localStorage.getItem(SELECTED_ENVELOPES_KEY);
            if (!raw) return [];
            try {
                const parsed = JSON.parse(raw);
                if (!Array.isArray(parsed)) return [];
                return parsed;
            } catch {
                return [];
            }
        },
        save: (data: Envelope[]) => {
            localStorage.setItem(SELECTED_ENVELOPES_KEY, JSON.stringify(data));
            return data;
        }
    };
}

export const getCurrencyData = (): StoredDataWrapper<string> => {
    return {
        load: () => {
            return localStorage.getItem(CURRENCY_KEY) ?? "EUR";
        },
        save: (currency: string) => {
            try {
                localStorage.setItem(CURRENCY_KEY, currency);
            } catch (e) {
                console.error(e);
                return "EUR";
            }
            return currency;
        }
    };
}
