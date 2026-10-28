import { NextResponse, NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7788/event', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                type: 'request',
                name: `${req.method} ${req.nextUrl.pathname}`,
                source: 'nextjs'
            })
        }).catch(() => { });
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};