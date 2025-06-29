import {useEffect, useState} from 'react';
import {getOwnedAccountsData} from "@/data";
import {AccountNumber, MappedCSVRow, Transaction, TransactionID} from "@/model";
import {advancedFilters} from "@/utility/datautils";

const useOwnedAccounts = () => {
    const [ownAccounts, setOwnAccounts] = useState<string[]>([])

    useEffect(() => {
        const ownedAccountsData = getOwnedAccountsData();
        setOwnAccounts(ownedAccountsData.load());
    }, []);

    const saveAccounts = (accounts: AccountNumber[]) => {
        setOwnAccounts(getOwnedAccountsData().save(accounts));
    }

    return {
        ownAccounts,
        isAccountOwned: (accountNumber: AccountNumber) => {
            return ownAccounts.includes(accountNumber);
        },
        addOwnedAccount: (accountNumber: AccountNumber) => {
            const newState = Array.from(new Set([...ownAccounts, accountNumber]));
            saveAccounts(newState);
        },
        removeOwnedAccount: (accountNumber: AccountNumber) => {
            const newState = [...ownAccounts].filter(accNo => accNo !== accountNumber);
            saveAccounts(newState);
        },
        filterIntraAccountTransaction: (row: MappedCSVRow) => {
            return !(ownAccounts.includes(row.mappedFrom) && ownAccounts.includes(row.mappedTo));
        },
        filterInterAccountTransaction: (row: Transaction) => {
            return (!ownAccounts.includes(row.from) || ownAccounts.includes(row.to));
        }
    }
};

export default useOwnedAccounts;