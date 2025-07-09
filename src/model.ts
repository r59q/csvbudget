// The header row
import {Dayjs} from "dayjs";
import {SchemaKey} from "@/utility/csvutils";

export type CSVHeaders = string[];

// Schema maps a CSVHeaders type to a key by using string.join("-") on the headers
export type CSVSchema = { headers: CSVHeaders, filename: CSVFile['name'] }
export type CSVSchemas = { [key: string]:  CSVSchema}

export interface RawCSV {
    name: string;
    content: string;
}

export interface CSVFile {
    name: string;
    getContent: () => string;
    schema: CSVSchema;
    schemaKey: SchemaKey;
}

export interface UnmappedSchema {
    key: SchemaKey;
    headers: CSVHeaders;
}

// one row of CSV as an object
export type CsvRow = Record<string, string> & { filename: CSVFile['name']; };

export type CSVRowId = number;

export type AccountNumber = string;

// TODO: probably changing to ExpensePost or ExpenseCategory, as it will conflict with budgets?
export type Category = string | "Unassigned";
export type Envelope = string | "Unassigned";

export type BudgetPost = { title: string; amount: number; }

export type TransactionCategoryMap = Record<string, Category>;
export type EnvelopeMap = Record<TransactionID, Envelope>;
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
export type TransactionType = "expense" | "income" | "transfer" | "refund" | "unknown"
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
    mappedFrom: AccountNumber | undefined;
    to: AccountNumber;
    mappedTo: AccountNumber | undefined;
    category: Category;
    guessedCategory: Category;
    type: TransactionType;
    guessedType: TransactionType;
    isTransfer: boolean;
    notes: string;
    amount: number;
    amountAfterRefund: number;
    linkedTransactions: TransactionLinkDescriptor[];
    guessedLinkedTransactions: TransactionLinkDescriptor[];
    envelope: Envelope;
    guessedEnvelope: Envelope;
}
