// The header row
export type CSVHeaders = string[];

// Schema maps a CSVHeaders type to a key by using string.join("-") on the headers
export type CSVSchemas = { [key: string]: CSVHeaders }

export type CSVFile = { name: string; content: string };

// one row of CSV as an object
export type CsvRow = Record<string, string>;

export type CSVRowId = number;

export type AccountNumber = string;

// TODO: probably changing to ExpensePost or ExpenseCategory, as it will conflict with budgets?
export type Category = string | "Unassigned";
export type Month = string;

export type RowCategoryMap = Record<CSVRowId, Category>;
export type RowIncomeMap = Record<CSVRowId, Month>;

export type MappedCSVRow = {
    mappedId: CSVRowId; // Hashed row
    mappedDate: string;
    mappedPosting: string;
    mappedFrom: string;
    mappedTo: string;
    mappedAmount: number;
    mappedCategory: Category;
} & CsvRow;

export type AccountMappings = Record<AccountNumber, string>