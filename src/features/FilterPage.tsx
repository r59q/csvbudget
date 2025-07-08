import {useTransactionsContext} from "@/context/TransactionsContext";
import useAccountMapping from "@/hooks/AccountMapping";
import useOwnedAccounts from "@/hooks/OwnedAccount";
import React, {useEffect, useRef, useState} from "react";
import {getAdvancedFiltersData} from "@/data";
import {formatEnvelope} from "@/utility/datautils";
import InfoBox from "@/components/InfoBox";
import { FaRegEnvelopeOpen } from "react-icons/fa6";
import { FaRegUserCircle } from "react-icons/fa";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";

const FilterPage = () => {
    const {transactions, envelopes, toggleSelectedEnvelope, isEnvelopeSelected} = useTransactionsContext();
    const {getAccountMapping} = useAccountMapping();
    const {isAccountOwned, removeOwnedAccount, addOwnedAccount} = useOwnedAccounts();
    const [filters, setFilters] = useState<string[]>([])
    const filterTextAreaRef = useRef<HTMLTextAreaElement | null>(null)

    useEffect(() => {
        setFilters(getAdvancedFiltersData().load());
    }, [])

    const toValues = new Set(transactions.map(e => e.to));
    const fromValues = new Set(transactions.map(e => e.from));
    const accounts = Array.from(new Set([...toValues, ...fromValues]))
        .filter(e => e !== "");

    const ownedAccounts = accounts.filter(e => isAccountOwned(e));
    const unknownAccounts = accounts.filter(e => !isAccountOwned(e))

    const handleAddFilter = () => {
        const textArea = filterTextAreaRef.current;
        if (!textArea) return;
        const filterText = textArea.value;
        const newState = [...filters, filterText]
        setFilters(getAdvancedFiltersData().save(newState))
        textArea.value = ''
    }

    const handleRemoveFilter = (filter: string) => {
        const newState = [...filters].filter(e => e !== filter);
        setFilters(newState)
        setFilters(getAdvancedFiltersData().save(newState))
    }

    return (
        <div className="flex pt-10 pb-10 flex-col gap-8 bg-gradient-to-b from-gray-950 to-[#0a0a0a]">
            <div className={"w-2/3 self-center flex flex-col gap-6"}>
                {/* Envelopes list at the top */}
                <div className="flex flex-col">
                    <InfoBox
                        icon={<FaRegEnvelopeOpen size={40} />}
                        title="About Envelope Selection"
                        description={<>Select which <span className="font-semibold">envelopes</span> (months) to include in your monthly averages. This is useful if your imported CSV covers partial months—only selected envelopes will be used for average calculations.</>}
                        secondary={<>For example, if your data covers 1.5 months, select just the full month to avoid skewed averages. This ensures only complete months are used for your envelope (monthly) statistics.</>}
                        tip={<><span className="font-semibold">Tip:</span> Selecting all but the last and earliest envelope is a good rule of thumb to ensure your averages are accurate. These envelopes are often incomplete and can distort your monthly average.</>}
                    />
                    <div className="flex flex-wrap gap-2 mb-4">
                        {envelopes && envelopes.length > 0 ? (
                            envelopes.map((env) => (
                                <button
                                    key={env}
                                    type="button"
                                    onClick={() => toggleSelectedEnvelope(env)}
                                    className={`transition-colors duration-150 flex items-center gap-2 px-4 py-1 rounded-full border text-xs font-semibold shadow-sm select-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                                ${isEnvelopeSelected(env)
                                        ? 'bg-blue-600 text-white border-blue-500 shadow-lg scale-105'
                                        : 'bg-gray-800 text-gray-200 border-gray-600 hover:bg-blue-900 hover:text-white'}`}
                                    aria-pressed={isEnvelopeSelected(env)}
                                >
                                    {isEnvelopeSelected(env) ? (
                                        <span className="inline-block w-2.5 h-2.5 bg-blue-300 rounded-full mr-1"/>
                                    ) : (
                                        <span className="inline-block w-2.5 h-2.5 bg-gray-400 rounded-full mr-1"/>
                                    )}
                                    {formatEnvelope(env)}
                                </button>
                            ))
                        ) : (
                            <span className="text-gray-400 text-xs">No envelopes found</span>
                        )}
                    </div>
                </div>

                <div>
                    {/* Account selection introduction styled like IncomePage */}
                    <InfoBox
                        icon={<FaRegUserCircle size={40} />}
                        title="About Account Selection (optional)"
                        description={<>Select which <span className="font-semibold">accounts</span> are yours. This helps the app distinguish between your own transfers and real expenses.</>}
                        secondary={<>When you move money between your own accounts, these transactions are ignored in your expense calculations. Only money leaving your accounts to external destinations is counted as spending.</>}
                        tip={<><span className="font-semibold">Tip:</span> If you see an account you recognize, add it to your accounts. This ensures your reports reflect only true expenses, not internal transfers.</>}
                    />
                    <div className="flex flex-col md:flex-row gap-8 mt-4">


                        <div className="flex-1 bg-gray-900/60 rounded-lg p-4 border border-gray-800 shadow-sm">
                            <p className="text-lg font-semibold text-gray-200 mb-2 flex items-center gap-2">
                                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"/>
                                Unknown Accounts
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {unknownAccounts.length === 0 && (
                                    <span className="text-gray-500 text-sm">No unknown accounts</span>
                                )}
                                {unknownAccounts.map(account => {
                                    const mappedAccount = getAccountMapping(account)
                                    return (
                                        <button
                                            className="transition-colors duration-150 px-3 py-1 rounded-full border border-gray-700 bg-gray-800 text-gray-300 hover:bg-blue-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs font-medium shadow-sm select-none"
                                            key={account}
                                            onClick={() => addOwnedAccount(account)}
                                            type="button"
                                        >
                                            <span className="mr-1 text-gray-400">+</span>
                                            {mappedAccount ?? account}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex-1 bg-gray-900/60 rounded-lg p-4 border border-gray-800 shadow-sm">
                            <p className="text-lg font-semibold text-gray-200 mb-2 flex items-center gap-2">
                                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full"/>
                                Your Accounts
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {ownedAccounts.length === 0 && (
                                    <span className="text-gray-500 text-sm">No owned accounts</span>
                                )}
                                {ownedAccounts.map(account => {
                                    const mappedAccount = getAccountMapping(account)
                                    return (
                                        <button
                                            className="transition-colors duration-150 px-3 py-1 rounded-full border border-blue-700 bg-blue-800 text-blue-100 hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs font-medium shadow-sm select-none"
                                            key={account}
                                            onClick={() => removeOwnedAccount(account)}
                                            type="button"
                                        >
                                            <span className="mr-1 text-blue-200">×</span>
                                            {mappedAccount ?? account}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced filters introduction styled like IncomePage */}
                <InfoBox
                    icon={<HiOutlineAdjustmentsHorizontal size={32} />}
                    title="Advanced Filters (optional)"
                    description={<>Advanced filters use JavaScript to evaluate each transaction row. You can filter transactions using custom logic.</>}
                    tip={<><span className="font-semibold">Example:</span> <span className="ml-2 text-blue-100">parseFloat(amount) &gt; -200 <span className="text-gray-400">// Shows only postings below -200</span></span></>}
                    className="mb-2"
                />
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <p className="text-sm text-gray-300 mb-1">Available fields:</p>
                        <table className="w-full text-xs bg-gray-900/60 border border-gray-800 rounded mb-2">
                            <thead>
                            <tr className="text-blue-300 text-left">
                                <th className="py-1 px-2 font-semibold">Field</th>
                                <th className="py-1 px-2 font-semibold">Type</th>
                                <th className="py-1 px-2 font-semibold">Description</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr className="border-t border-gray-800">
                                <td className="py-1 px-2 font-mono text-blue-200">row</td>
                                <td className="py-1 px-2 text-gray-400">object</td>
                                <td className="py-1 px-2 text-gray-300">Raw data, use syntax <span
                                    className="font-mono">row["csvColumnHeader"]</span></td>
                            </tr>
                            <tr className="border-t border-gray-800">
                                <td className="py-1 px-2 font-mono text-blue-200">amount</td>
                                <td className="py-1 px-2 text-gray-400">string</td>
                                <td className="py-1 px-2 text-gray-300">The amount</td>
                            </tr>
                            <tr className="border-t border-gray-800">
                                <td className="py-1 px-2 font-mono text-blue-200">to</td>
                                <td className="py-1 px-2 text-gray-400">string</td>
                                <td className="py-1 px-2 text-gray-300">The 'to' account (account no.)</td>
                            </tr>
                            <tr className="border-t border-gray-800">
                                <td className="py-1 px-2 font-mono text-blue-200">from</td>
                                <td className="py-1 px-2 text-gray-400">string</td>
                                <td className="py-1 px-2 text-gray-300">The 'from' account (account no.)</td>
                            </tr>
                            <tr className="border-t border-gray-800">
                                <td className="py-1 px-2 font-mono text-blue-200">posting</td>
                                <td className="py-1 px-2 text-gray-400">string</td>
                                <td className="py-1 px-2 text-gray-300">The original posting text</td>
                            </tr>
                            </tbody>
                        </table>
                        <p className="text-xs text-gray-400 mt-1">Tip: Use <span
                            className="font-mono">console.log(row)</span> to see all fields on the row.</p>

                        {/* Moved Add Filter section below available fields */}
                        <div className="flex flex-col gap-2 mt-4">
                            <label htmlFor="advanced-filter" className="text-sm text-gray-300 mb-1">Add a new
                                filter:</label>
                            <textarea
                                id="advanced-filter"
                                ref={filterTextAreaRef}
                                placeholder={"Advanced Filter"}
                                className="border border-blue-800 bg-gray-950 text-blue-100 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm min-h-[48px] resize-y"
                            />
                            <button
                                className="mt-1 px-3 py-1 rounded bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow focus:outline-none focus:ring-2 focus:ring-blue-400 w-fit"
                                onClick={handleAddFilter}
                                type="button"
                            >
                                Add filter
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {filters.map((filter, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-2 bg-blue-950/60 border border-blue-800 rounded-full px-4 py-1 text-blue-100 text-xs font-mono shadow cursor-pointer hover:bg-blue-900 transition-colors select-none"
                            onClick={() => handleRemoveFilter(filter)}
                            title="Remove filter"
                        >
                            <span className="text-blue-300">{filter}</span>
                            <span className="ml-1 text-blue-400">&times;</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterPage;

