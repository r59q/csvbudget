'use client';

import { useEffect } from 'react';
import { LOCALSTORAGE_KEYS } from '@/data';

export default function ResetPage() {
    useEffect(() => {
        LOCALSTORAGE_KEYS.forEach(key => localStorage.removeItem(key));
        setTimeout(() => {
            window.location.replace('/import');
        }, 1000); // Delay to show the reset message
    }, []);

    return <div className="p-8 text-center">Resetting app...</div>;
}