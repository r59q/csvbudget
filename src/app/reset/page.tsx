'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPage() {
    const router = useRouter();

    useEffect(() => {
        localStorage.clear();
        router.replace('/upload');
    }, [router]);

    return <div className="p-8 text-center">Resetting app...</div>;
}