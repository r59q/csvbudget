'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALSTORAGE_KEYS } from '@/data';

export default function ResetPage() {
    const router = useRouter();

    useEffect(() => {
        LOCALSTORAGE_KEYS.forEach(key => localStorage.removeItem(key));
        router.replace('/import');
    }, [router]);

    return <div className="p-8 text-center">Resetting app...</div>;
}