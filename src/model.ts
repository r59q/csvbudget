// The header row
import {Dayjs} from "dayjs";
import {SchemaKey} from "@/utility/csvutils";

export type CSVHeaders = string[];

// Schema maps a CSVHeaders type to a key by using string.join("-") on the headers
export type CSVSchemas = { [key: string]: CSVHeaders }

export type CSVFile = { name: string; content: string };

export interface UnmappedSchema {
    key: SchemaKey;
    headers: CSVHeaders;
}

// one row of CSV as an object
export type CsvRow = Record<string, string>;

export type CSVRowId = number;

export type AccountNumber = string;

// TODO: probably changing to ExpensePost or ExpenseCategory, as it will conflict with budgets?
export type Category = string | "Unassigned";
export type Envelope = string;

export type BudgetPost = { title: string; amount: number; }

export type RowCategoryMap = Record<CSVRowId, Category>;
export type RowIncomeMap = Record<CSVRowId, Envelope>;
export type CategoryBudgetPostMap = Record<Category, BudgetPost["title"]>;

export type MappedCSVRow = {
    mappedId: TransactionID; // Hashed row
    mappedDate: string;
    mappedText: string;
    mappedFrom: string;
    mappedTo: string;
    mappedAmount: number;
} & CsvRow;

export type AccountMappings = Record<AccountNumber, string>

export type TransactionID = number;
export type TransactionType = "expense" | "income" | "transfer" | "unknown"
export type LinkType = "refund" | "unknown" | "transfer"

export interface TransactionLinkDescriptor {
    linkedId: TransactionID;
    linkType: LinkType
}

export interface Transaction {
    id: TransactionID;
    date: Dayjs;
    text: string;
    from: AccountNumber;
    mappedFrom: AccountNumber;
    to: AccountNumber;
    mappedTo: AccountNumber;
    category: Category;
    type: TransactionType;
    guessedType: TransactionType;
    isTransfer: boolean;
    notes: string;
    amount: number;
    linkedTransactions: TransactionLinkDescriptor[];
    guessedLinkedTransactions: TransactionLinkDescriptor[];
    envelope: Envelope;
}
