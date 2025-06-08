"use client";
import React, {useEffect, useRef, useState} from 'react';
import {advancedFilters, getAccountValueMappings, loadCsvs, MappedCsvRow} from "@/utility/csvutils";
import {saveAdvancedFilters} from "@/utility/datautils";

const FilterPage = () => {
    const [csvRows, setCsvRows] = useState<MappedCsvRow[]>([]);
    const [accountValueMappings, setAccountValueMappings] = useState<Record<string, string>>({});
    const [ownAccounts, setOwnAccounts] = useState<string[]>([])
    const [filters, setFilters] = useState<string[]>([])
    const filterTextAreaRef = useRef<HTMLTextAreaElement | null>(null)

    useEffect(() => {
        const mappedCsvs = loadCsvs();
        setCsvRows(mappedCsvs);
        setAccountValueMappings(getAccountValueMappings());
        setOwnAccounts(JSON.parse(localStorage.getItem("own_accounts") ?? "[]"))
        setFilters(JSON.parse(localStorage.getItem("advanced_filters") ?? "[]"))
    }, [])

    const handleAddAccount = (account: string) => {
        const newState = [...ownAccounts, account]
        setOwnAccounts(newState)
        localStorage.setItem("own_accounts", JSON.stringify(newState))
    }

    const handleRemoveAccount = (account: string) => {
        const newState = [...ownAccounts].filter(e => e !== account)
        setOwnAccounts(newState);
        localStorage.setItem("own_accounts", JSON.stringify(newState))
    }
    const toValues = new Set(csvRows.map(e => e.mappedTo));
    const fromValues = new Set(csvRows.map(e => e.mappedFrom));
    const accounts = Array.from(new Set([...toValues, ...fromValues]))
        .filter(e => e !== "");

    const ownedAccounts = accounts.filter(e => ownAccounts.includes(e));
    const unknownAccounts = accounts.filter(e => !ownAccounts.includes(e))

    const handleAddFilter = () => {
        const textArea = filterTextAreaRef.current;
        if (!textArea) return;
        const filterText = textArea.value;
        const newState = [...filters, filterText]
        setFilters(saveAdvancedFilters(newState))
        textArea.value = ''
    }

    const handleRemoveFilter = (filter: string) => {
        const newState = [...filters].filter(e => e !== filter);
        setFilters(newState)
        setFilters(saveAdvancedFilters(newState))
    }

    return (
        <div className="p-4 max-w-2xl mx-auto flex flex-col gap-8">
            <div>
                <p className={"text-xl"}>
                    Select which of these accounts are yours.
                </p>
                <p>Transactions between your own account will not count
                    towards your expenses. This means moving money from one of your account to another will not count as an expense</p>
                <p className={"text-sm pt-2"}>Click an account to move it</p>
                <div className={"flex flex-row justify-between"}>
                    <div>
                        <p className={"text-2xl"}>Unknown Accounts</p>
                        {unknownAccounts.map(account => {
                            const mappedAccount = accountValueMappings[account]
                            return <div className={"pt-1 cursor-pointer select-none"} key={account}
                                        onClick={() => handleAddAccount(account)}>
                                {mappedAccount ?? account}
                            </div>;
                        })}
                    </div>
                    <div>
                        <p className={"text-2xl"}>Your Accounts</p>
                        {ownedAccounts.map(account => {
                            const mappedAccount = accountValueMappings[account]
                            return <div className={"pt-1 cursor-pointer select-none"} key={account}
                                        onClick={() => handleRemoveAccount(account)}>
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
                {csvRows.filter(advancedFilters).map((row, idx) => {
                    return <tr key={idx}>
                        <td>{row.mappedDate}</td>
                        <td>{row.mappedPosting}</td>
                        <td>{row.mappedAmount}</td>
                    </tr>
                })}
                </tbody>
            </table>
        </div>
    );
};

export default FilterPage;