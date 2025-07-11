// Currency options for selects and formatting
export interface CurrencyOption {
    value: string; // ISO 4217 code
    label: string;
}

export const currencyOptions: CurrencyOption[] = [
    {value: "DKK", label: "Danish Krone (DKK)"},
    {value: "USD", label: "US Dollar (USD)"},
    {value: "EUR", label: "Euro (EUR)"},
    {value: "GBP", label: "British Pound (GBP)"},
    {value: "SEK", label: "Swedish Krona (SEK)"},
    {value: "NOK", label: "Norwegian Krone (NOK)"},
    {value: "CHF", label: "Swiss Franc (CHF)"},
    {value: "JPY", label: "Japanese Yen (JPY)"},
    {value: "CAD", label: "Canadian Dollar (CAD)"},
    {value: "AUD", label: "Australian Dollar (AUD)"},
    {value: "CNY", label: "Chinese Yuan (CNY)"},
    {value: "PLN", label: "Polish Zloty (PLN)"},
    {value: "CZK", label: "Czech Koruna (CZK)"},
    {value: "HUF", label: "Hungarian Forint (HUF)"},
    {value: "ISK", label: "Icelandic Krona (ISK)"},
    {value: "ZAR", label: "South African Rand (ZAR)"},
    {value: "INR", label: "Indian Rupee (INR)"},
    {value: "BRL", label: "Brazilian Real (BRL)"},
    {value: "SGD", label: "Singapore Dollar (SGD)"},
    {value: "NZD", label: "New Zealand Dollar (NZD)"},
].sort((a, b) => a.label.localeCompare(b.label));
