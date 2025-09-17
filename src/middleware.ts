import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const isAuth = Boolean(token && !isTokenExpired(token));

    const pathname = request.nextUrl.pathname.replace(/\/$/, '');

    const PUBLIC_PATHS: RegExp[] = [
        /^\/login$/,
        /^\/register$/,
        /^\/shared\/.*/,
        /^\/api\/auth\/login$/,
        /^\/api\/auth\/register$/,
        /^\/api\/tickets$/,
    ];

    const isPublicPath = (path: string) => PUBLIC_PATHS.some((r) => r.test(path));

    // Guard login
    if (!isAuth && !isPublicPath(pathname)) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    if (isAuth && pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // =====================
    // ROLE-BASED GUARD TEMPLATE
    // =====================
    if (isAuth && token) {
        const roleId = getRoleIdFromToken(token);

        // Mapping role → blokir path apa saja
        const ROLE_GUARDS: Record<string, RegExp[]> = {
            ADMIN: [
                /^\/dashboard\/members(\/.*)?$/,
                /^\/api\/members(\/.*)?$/,
            ],
            CASHIER: [],
            SPV: [],
            SPVJ: [],
            AC: [],
            SC: [],
            SUPER: [],
        };

        const blockedPaths = ROLE_GUARDS[roleId as keyof typeof ROLE_GUARDS] || [];
        if (blockedPaths.some((r) => r.test(pathname))) {
            if (pathname.startsWith('/api/')) {
                return new NextResponse(
                    JSON.stringify({ message: 'Forbidden by role guard' }),
                    { status: 403, headers: { 'content-type': 'application/json' } }
                );
            }

            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }

    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next|static|favicon.ico).*)'],
};

// ===== Utils =====
function isTokenExpired(token: string): boolean {
    try {
        const payload = decodeJwtPayload(token);
        const exp = payload?.exp;
        if (!exp) return true;
        const now = Math.floor(Date.now() / 1000);
        return now >= exp;
    } catch {
        return true;
    }
}

function getRoleIdFromToken(token: string): string | undefined {
    try {
        const payload = decodeJwtPayload(token);
        return payload?.roleId || payload?.role || payload?.user?.roleId;
    } catch {
        return undefined;
    }
}

function decodeJwtPayload(token: string) {
    const part = token.split('.')[1];
    if (!part) throw new Error('Invalid JWT');
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = decodeURIComponent(
        atob(padded)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(json);
}
