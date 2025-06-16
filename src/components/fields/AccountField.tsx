import React, {useEffect, useRef, useState} from 'react';
import useOwnedAccounts from '@/hooks/OwnedAccount';
import {AccountNumber} from "@/model";
import {useGlobalContext} from "@/context/GlobalContext";

interface AccountFieldProps {
    account: AccountNumber;
}

const AccountField: React.FC<AccountFieldProps> = ({account}) => {
    const {
        addAccountMapping,
        isAccountOwned,
        addOwnedAccount,
        removeOwnedAccount,
        getAccountMapping
    } = useGlobalContext();
    const mappedAccount = getAccountMapping(account);
    const owned = isAccountOwned(account);
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState(mappedAccount);

    const inputRef = useRef<HTMLInputElement>(null);

    // Add this effect to keep editValue in sync with mappedAccount
    useEffect(() => {
        setEditValue(mappedAccount);
    }, [mappedAccount]);

    const handleToggle = () => {
        if (owned) {
            removeOwnedAccount(account);
        } else {
            addOwnedAccount(account);
        }
    };

    const handleEdit = () => {
        setEditValue(mappedAccount);
        setEditing(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditValue(e.target.value);
    };

    const handleInputBlur = () => {
        setEditing(false);
        setEditValue(mappedAccount);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (editValue.trim() !== '' && editValue !== mappedAccount) {
                addAccountMapping(account, editValue.trim());
            }
            setEditing(false);
        } else if (e.key === 'Escape') {
            setEditing(false);
            setEditValue(mappedAccount);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {editing ? (
                <input
                    ref={inputRef}
                    className="px-1 py-0.5 rounded border border-gray-400 text-sm bg-gray-800 text-white w-28"
                    value={editValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                />
            ) : (
                <span
                    className={owned ? "font-bold text-green-600 cursor-pointer" : "text-gray-300 cursor-pointer"}
                    onClick={handleEdit}
                    title="Click to edit account name"
                >
                    {mappedAccount}
                </span>
            )}
            <button
                className={`px-2 py-0.5 rounded text-xs border ${owned ? 'bg-green-700 text-white border-green-700 hover:bg-green-800' : 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-800'}`}
                onClick={handleToggle}
                title={owned ? 'Remove from owned accounts' : 'Mark as owned account'}
            >
                {owned ? '✓ Owned' : '+ Own'}
            </button>
        </div>
    );
};

export default AccountField;