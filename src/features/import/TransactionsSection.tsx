import React, {useState} from "react";
import TransactionTable from "@/features/transaction/TransactionTable";
import {useTransactionsContext} from "@/context/TransactionsContext";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";

interface TransactionsSectionProps {}

const TransactionsSection = ({}: TransactionsSectionProps) => {
    const {transactions} = useTransactionsContext();
    const [collapsed, setCollapsed] = useState(true);

    return (
        <div className="bg-gray-900 border-gray-700 border-solid border p-4 rounded-lg shadow-sm mb-10 transition-all duration-300 w-full">
            <button
                className="w-full text-left font-semibold mb-2 flex items-center gap-2 focus:outline-none select-none group cursor-pointer hover:bg-gray-700 active:bg-gray-600 rounded px-2 py-2 transition-colors duration-150"
                onClick={() => setCollapsed(c => !c)}
                aria-expanded={!collapsed}
                aria-controls="transactions-table-section"
                type="button"
            >
                <span className="transition-transform duration-200 group-hover:scale-110">
                    {collapsed ? <FiChevronRight /> : <FiChevronDown />}
                </span>
                <span className="underline decoration-dotted underline-offset-4 group-hover:decoration-solid transition-colors duration-150">All transactions</span>
                <span className="ml-auto text-xs text-gray-400 group-hover:text-gray-200 transition-colors duration-150">{collapsed ? 'Show' : 'Hide'}</span>
            </button>
            <div
                id="transactions-table-section"
                className={collapsed ? "h-0 overflow-hidden" : "h-auto"}
                style={{transition: 'height 0.3s', width: '100%'}}
            >
                <div className={collapsed ? "hidden" : "block w-full"}>
                    <p className={"py-2"}>These are all the transactions we detected.</p>
                    <TransactionTable compact pageSize={50} transactions={transactions}/>
                </div>
            </div>
        </div>
    );
};

export default TransactionsSection;
