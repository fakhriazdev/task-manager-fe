import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const isAuth = Boolean(token && !isTokenExpired(token));
    const pathname = request.nextUrl.pathname;

    const PUBLIC_PATHS = ['/login', '/register', '/api/auth/login', '/api/auth/register'];

    const isPublicPath = PUBLIC_PATHS.includes(pathname);

    if (!isAuth && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isAuth && pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next|static|favicon.ico).*)'],
};

function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const exp = payload.exp;
        if (!exp) return true;

        const currentTime = Math.floor(Date.now() / 1000);
        return currentTime >= exp;
    } catch (error) {
        console.error(error);
        return true;
    }
}
