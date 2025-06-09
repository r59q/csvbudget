import {useEffect, useState} from 'react';
import {getAccountMappingData} from "@/data";

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

    return {
        accountValueMappings,
        getAccountMapping: (original: string) => {
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
        removeAccountMapping: (original: string) => {
            const updated = {...accountValueMappings};
            delete updated[original];
            saveValueMappings(updated);
        }
    }
};

export default useAccountMapping;