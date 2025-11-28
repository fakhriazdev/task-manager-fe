import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const isAuth = Boolean(token && !isTokenExpired(token));

    const pathname = request.nextUrl.pathname.replace(/\/$/, '');
    const isApi = pathname.startsWith('/api/');

    const PUBLIC_PATHS: RegExp[] = [
        /^\/login$/,
        /^\/register$/,
        /^\/shared\/.*/,
        /^\/api\/auth\/login$/,
        /^\/api\/auth\/register$/,
        /^\/api\/tickets$/,
    ];

    const isPublicPath = (path: string) => PUBLIC_PATHS.some((r) => r.test(path));

    // =====================
    // GUARD UNAUTH (API vs PAGE)
    // =====================
    if (!isAuth && !isPublicPath(pathname)) {
        // 🔹 Kalau request ke API tapi belum auth → balikin JSON 401
        if (isApi) {
            return new NextResponse(
                JSON.stringify({ message: 'Unauthenticated' }),
                { status: 401, headers: { 'content-type': 'application/json' } },
            );
        }

        // 🔹 Kalau request ke page biasa → redirect ke /login
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Kalau sudah login dan akses /login → lempar ke /dashboard
    if (isAuth && pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // =====================
    // ROLE-BASED GUARD
    // =====================
    if (isAuth && token) {
        const roleId = getRoleIdFromToken(token);

        const ROLE_GUARDS: Record<string, RegExp[]> = {
            ADMIN: [
                /^\/dashboard\/members(\/.*)?$/,
                /^\/api\/members(\/.*)?$/,
            ],
            CASHIER: [],
            STAFF: [],
            SPV: [],
            SPVJ: [],
            AC: [],
            SC: [],
            SUPER: [],
        };

        const blockedPaths = ROLE_GUARDS[roleId as keyof typeof ROLE_GUARDS] || [];
        const isBlocked = blockedPaths.some((r) => r.test(pathname));

        if (isBlocked) {
            // 🔹 API → balikin JSON 403
            if (isApi) {
                return new NextResponse(
                    JSON.stringify({ message: 'Forbidden by role guard' }),
                    { status: 403, headers: { 'content-type': 'application/json' } },
                );
            }

            // 🔹 Page → redirect ke /unauthorized
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
