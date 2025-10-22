import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const token = request.cookies.get('refreshToken')?.value || '';
    
    console.log('Middleware running for path:', path);
    console.log('Token present:', !!token);

    // ⭐ DELETE ALL COOKIES when visiting home page "/"
    if (path === '/') {
        const response = NextResponse.next();
        
        // Delete refreshToken cookie
        response.cookies.set('refreshToken', '', {
            expires: new Date(0),
            path: '/',
            httpOnly: true,
        });
        
        console.log('Cookies deleted on home page');
        return response;
    }

    // // Protect dashboard route
    if (path === '/dashboard') {
        if (token) {
            try {
                // jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string);
                return NextResponse.next();
            } catch (error) {
                console.log("Token verification failed:", error);
                
                // Delete invalid token and redirect
                const response = NextResponse.redirect(new URL('/', request.url));
                response.cookies.delete('refreshToken');
                return response;
            }
        } else {
            // No token, redirect to login
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // // ⭐ Prevent logged-in users from accessing login/signup
    // const isAuthPage = path === '/login' || path === '/signup';
    // if (isAuthPage && token) {
    //     try {
    //         jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string);
    //         // Valid token, redirect to dashboard
    //         return NextResponse.redirect(new URL('/dashboard', request.url));
    //     } catch (error) {
    //         // Invalid token, allow access to auth pages
    //         return NextResponse.next();
    //     }
    // }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/login',
        '/signup',
        '/dashboard/:path*'
    ]
};