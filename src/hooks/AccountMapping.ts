import {useCallback, useEffect, useState} from 'react';
import {getAccountMappingData} from "@/data";
import {AccountNumber} from "@/model";

const useAccountMapping = () => {
    const [accountValueMappings, setAccountValueMappings] = useState<Record<string, string>>({});

    useEffect(() => {
        const loaded = getAccountMappingData().load();
        setAccountValueMappings(loaded);
    }, []);

    const saveValueMappings = (updated: Record<string, string>) => {
        setAccountValueMappings(
            getAccountMappingData().save(updated)
        );
    };

    const removeAccountMapping = (original: string) => {
        const updated = {...accountValueMappings};
        delete updated[original];
        saveValueMappings(updated);
    };
    return {
        accountValueMappings,
        getAccountMapping: (original: AccountNumber) => {
            const accountValueMapping = accountValueMappings[original];
            if (!accountValueMapping) {
                return original;
            }
            return accountValueMapping;
        },
        addAccountMapping: (original: string, mapped: string) => {
            const updated = {...accountValueMappings};
            updated[original] = mapped
            saveValueMappings(updated);
        },
        removeAccountMapping
    }
};

export default useAccountMapping;