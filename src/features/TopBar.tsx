import Link from 'next/link';
import React from 'react';
import { FiDownload, FiFilter, FiDollarSign, FiBarChart2, FiPieChart, FiRefreshCw } from 'react-icons/fi';
import NavLink from './NavLink';

const TopBar = () => {
    return (
        <header className="border-b-2 border-gray-300 bg-white dark:bg-gray-900 shadow-sm p-2 flex flex-row items-center justify-between">
            <div className="flex items-center gap-6">
                <Link href="/" className="text-2xl select-none font-bold text-blue-700 dark:text-blue-300 tracking-tight px-2 hover:underline transition-all">
                    CSVBudget
                </Link>
                <nav className="flex gap-2">
                    <NavLink href="/upload" icon={<FiDownload />}>Import</NavLink>
                    <NavLink href="/filter" icon={<FiFilter />}>Filter</NavLink>
                    <NavLink href="/income" icon={<FiDollarSign />}>Income</NavLink>
                    <NavLink href="/insight" icon={<FiBarChart2 />}>Insight</NavLink>
                    <NavLink href="/budget" icon={<FiPieChart />}>Budget</NavLink>
                </nav>
            </div>
            <div>
                <NavLink href="/reset" icon={<FiRefreshCw />} border>Reset</NavLink>
            </div>
        </header>
    );
};

export default TopBar;

