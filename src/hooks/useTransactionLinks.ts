import { useState, useEffect } from "react";
import { Transaction, TransactionLinkDescriptor, TransactionID } from "@/model";
import { getTransactionLinksData } from "@/data";

export default function useTransactionLinks() {
    const [storedLinks, setStoredLinks] = useState<Record<number, TransactionLinkDescriptor[]>>({});

    useEffect(() => {
        const transactionLinksStore = getTransactionLinksData();
        setStoredLinks(transactionLinksStore.load());
    }, []);

    const setTransactionLink = (a: Transaction, b: Transaction) => {
        const transactionLinksStore = getTransactionLinksData();
        setStoredLinks(prev => {
            const newLinks = { ...prev };
            if (!newLinks[a.id]) newLinks[a.id] = [];
            if (!newLinks[a.id].some(l => l.linkedId === b.id)) {
                newLinks[a.id] = [...newLinks[a.id], { linkedId: b.id, linkType: "unknown" }];
            }
            if (!newLinks[b.id]) newLinks[b.id] = [];
            if (!newLinks[b.id].some(l => l.linkedId === a.id)) {
                newLinks[b.id] = [...newLinks[b.id], { linkedId: a.id, linkType: "unknown" }];
            }
            transactionLinksStore.save(newLinks);
            return newLinks;
        });
    };

    const unsetTransactionLink = (a: Transaction, b: Transaction) => {
        const transactionLinksStore = getTransactionLinksData();
        setStoredLinks(prev => {
            const newLinks = { ...prev };
            if (newLinks[a.id]) {
                newLinks[a.id] = newLinks[a.id].filter(l => l.linkedId !== b.id);
                if (newLinks[a.id].length === 0) delete newLinks[a.id];
            }
            if (newLinks[b.id]) {
                newLinks[b.id] = newLinks[b.id].filter(l => l.linkedId !== a.id);
                if (newLinks[b.id].length === 0) delete newLinks[b.id];
            }
            transactionLinksStore.save(newLinks);
            return newLinks;
        });
    };

    const setTransactionLinkType = (a: Transaction, b: Transaction, linkType: TransactionLinkDescriptor['linkType']) => {
        const transactionLinksStore = getTransactionLinksData();
        setStoredLinks(prev => {
            const newLinks = { ...prev };
            if (newLinks[a.id]) {
                newLinks[a.id] = newLinks[a.id].map(l =>
                    l.linkedId === b.id ? { ...l, linkType } : l
                );
            }
            if (newLinks[b.id]) {
                newLinks[b.id] = newLinks[b.id].map(l =>
                    l.linkedId === a.id ? { ...l, linkType } : l
                );
            }
            transactionLinksStore.save(newLinks);
            return newLinks;
        });
    };

    return {
        storedLinks,
        setTransactionLink,
        unsetTransactionLink,
        setTransactionLinkType,
    };
}
