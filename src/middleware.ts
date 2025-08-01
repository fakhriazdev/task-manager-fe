import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const isAuth = Boolean(token && !isTokenExpired(token));

    // 💡 Hapus trailing slash agar path jadi konsisten (misal /login dan /login/ dianggap sama)
    const pathname = request.nextUrl.pathname.replace(/\/$/, '');

    const PUBLIC_PATHS = [
        '/login',
        '/register',
        '/api/auth/login',
        '/api/auth/register',
    ];

    const isPublicPath = PUBLIC_PATHS.includes(pathname);

    // 🔁 Redirect ke /login jika belum login dan akses bukan halaman publik
    if (!isAuth && !isPublicPath) {
        return NextResponse.redirect(new URL('/login/', request.url));
    }

    // 🔁 Jika sudah login, tapi malah ke /login → arahkan ke dashboard
    if (isAuth && pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next|static|favicon.ico).*)'],
};

// 🧠 Mengecek apakah JWT sudah kadaluarsa
function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(
            Buffer.from(token.split('.')[1], 'base64').toString()
        );
        const exp = payload.exp;
        if (!exp) return true;

        const currentTime = Math.floor(Date.now() / 1000);
        return currentTime >= exp;
    } catch (error) {
        console.error('Failed to parse JWT', error);
        return true;
    }
}
