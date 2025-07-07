import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;

    const isAuth = Boolean(token && !isTokenExpired(token));
    const isLoginPage = request.nextUrl.pathname === '/login';

    if (!isAuth && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isAuth && isLoginPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next|api|static|favicon.ico).*)',
    ],
};

function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const exp = payload.exp;
        if (!exp) return true;

        const currentTime = Math.floor(Date.now() / 1000);
        return currentTime >= exp;
    } catch (error) {
        return true;
    }
}