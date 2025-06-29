"use client";
import React, {useEffect, useRef, useState} from 'react';
import useAccountMapping from "@/hooks/AccountMapping";
import useOwnedAccounts from "@/hooks/OwnedAccount";
import {getAdvancedFiltersData} from "@/data";
import {advancedFilters, formatDayjs, formatEnvelope} from "@/utility/datautils";

import {TransactionsProvider, useTransactionsContext} from "@/context/TransactionsContext";

const Page = () => {
    return (
        <TransactionsProvider>
            <FilterPage/>
        </TransactionsProvider>
    );
};


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
        <div className="p-4 max-w-2xl mx-auto flex flex-col gap-8">
            {/* Envelopes list at the top */}
            <div className="flex flex-wrap gap-2 mb-4">
                {envelopes && envelopes.length > 0 ? (
                    envelopes.map((env) => (
                        <span key={env} onClick={() => toggleSelectedEnvelope(env)}
                              className="cursor-pointer px-3 py-1 bg-gray-200 text-gray-800 rounded text-xs font-semibold select-none"
                                style={{
                                    backgroundColor: isEnvelopeSelected(env) ? '#4a90e2' : '#e0e0e0',
                                    color: isEnvelopeSelected(env) ? '#ffffff' : '#000000'
                                }}>
                            {formatEnvelope(env)}
                        </span>
                    ))
                ) : (
                    <span className="text-gray-400 text-xs">No envelopes found</span>
                )}
            </div>
            <div>
                <p className={"text-xl"}>
                    Select which of these accounts are yours.
                </p>
                <p>Transactions between your own account will not count
                    towards your expenses. This means moving money from one of your account to another will not count as
                    an expense</p>
                <p className={"text-sm pt-2"}>Click an account to move it</p>
                <div className={"flex flex-row justify-between"}>
                    <div>
                        <p className={"text-2xl"}>Unknown Accounts</p>
                        {unknownAccounts.map(account => {
                            const mappedAccount = getAccountMapping(account)
                            return <div className={"pt-1 cursor-pointer select-none"} key={account}
                                        onClick={() => addOwnedAccount(account)}>
                                {mappedAccount ?? account}
                            </div>;
                        })}
                    </div>
                    <div>
                        <p className={"text-2xl"}>Your Accounts</p>
                        {ownedAccounts.map(account => {
                            const mappedAccount = getAccountMapping(account)
                            return <div className={"pt-1 cursor-pointer select-none"} key={account}
                                        onClick={() => removeOwnedAccount(account)}>
                                {mappedAccount ?? account}
                            </div>;
                        })}
                    </div>
                </div>
            </div>

            <div className={"flex flex-col flex-grow gap-2"}>
                <p className={"text-2xl"}>Advanced filters</p>
                <p>Advanced filters uses javascript to evaluate a row - Example</p>
                <pre className={"text-sm"}>
                    {"parseFloat(amount) > -200 // Shows only postings below -200"}
                </pre>
                <p>Available fields</p>
                <pre>{`
row     - Raw data use syntax row["csvColumnHeader"]
amount  - string: the amount
to      - string: The 'to' account (account no.)
from    - string: The 'from' account (account no.)
posting - string: The original posting text
                `}
                </pre>
                tip: Use console.log(row) to see all fields on the row
                <textarea ref={filterTextAreaRef} placeholder={"Advanced Filter"}
                          className={"border-solid border-2 p-2"}/>
                <button className={"border-solid border-2 p-2"} onClick={handleAddFilter}>Add filter</button>
                {filters.map((filter, idx) => {
                    return <pre onClick={() => handleRemoveFilter(filter)} key={idx}
                                className={"text-sm border-solid border-2 p-2"}>
                        {filter}
                    </pre>
                })}
            </div>
            <table>
                <thead>
                </thead>
                <tbody>
                {transactions.filter(advancedFilters).map((row, idx) => {
                    return <tr key={idx}>
                        <td>{formatDayjs(row.date)}</td>
                        <td>{row.text}</td>
                        <td>{row.amount}</td>
                    </tr>
                })}
                </tbody>
            </table>
        </div>
    );
};

export default Page;
