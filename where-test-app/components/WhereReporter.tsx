'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function WhereReporter() {
    const pathname = usePathname();

    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') {
            return;
        }
        fetch('http://127.0.0.1:7788/event', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ type: 'route', name: pathname, source: 'nextjs' })
        }).catch(() => { });
    }, [pathname]);

    return null;
}