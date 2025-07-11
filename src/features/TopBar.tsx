import Link from 'next/link';
import React from 'react';
import {FiBarChart2, FiDollarSign, FiDownload, FiFilter, FiPieChart, FiRefreshCw} from 'react-icons/fi';
import NavLink from './NavLink';
import {useGlobalContext} from "@/context/GlobalContext";
import {currencyOptions} from "@/utility/currencyOptions";

const TopBar = () => {
    const {currency, setCurrency} = useGlobalContext()
    return (
        <header
            className="border-b-2 border-gray-300 bg-gray-900 shadow-sm p-2 flex flex-row items-center justify-between">
            <div className="flex items-center gap-6">
                <Link href="/"
                      className="text-2xl select-none font-bold text-blue-300 tracking-tight px-2 hover:underline transition-all">
                    CSVBudget
                </Link>
                <nav className="flex gap-2">
                    <NavLink href="/import" icon={<FiDownload/>}>Import</NavLink>
                    <NavLink href="/income" icon={<FiDollarSign/>}>Income</NavLink>
                    <NavLink href="/filter" icon={<FiFilter/>}>Filter</NavLink>
                    <NavLink href="/insight" icon={<FiBarChart2/>}>Insight</NavLink>
                    <NavLink href="/budget" icon={<FiPieChart/>}>Budget</NavLink>
                </nav>
            </div>
            <div className={"flex flex-row gap-4"}>
                <select
                    className="px-2 py-1 border rounded bg-gray-800 text-gray-100"
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    aria-label="Select currency"
                >
                    {currencyOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <NavLink warning={"Are you sure? This will reset all data"} href="/reset" icon={<FiRefreshCw/>}
                         border>Reset</NavLink>
            </div>
        </header>
    );
};

export default TopBar;
