import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { PUBLIC_ALLOWED_ORIGINS } from '$env/static/public';
import { AuthServer } from '$lib/domain/auth/auth.server';
import { AuthRepository } from '$lib/domain/auth/auth.repository';

const authServer = new AuthServer(new AuthRepository());

// 0. Debug Handler - Log each request.
const logRequests: Handle = async ({ event, resolve }) => {
    // Enhanced logging
    console.log('[DEBUG]', {
        path: event.url.pathname,
        method: event.request.method,
        headers: Object.fromEntries(event.request.headers),
        timestamp: new Date().toISOString()
    });
    return resolve(event);
};

// 1. Auth Handler - Protect /app routes
const handleAuth: Handle = async ({ event, resolve }) => {
    // Skip auth check for OPTIONS requests
    if (event.request.method === 'OPTIONS') {
        return resolve(event);
    }

    const session = event.cookies.get('session');

    // Protect sensitive API routes
    if (event.url.pathname.startsWith('/api') &&
        !event.url.pathname.startsWith('/api/auth/login') &&
        !event.url.pathname.startsWith('/api/auth/register')) {

        if (!session) {
            return new Response('Unauthorized', { status: 401 });
        }

        const result = await authServer.validateSession(session);
        if (!result) {
            event.cookies.delete('session', { path: '/' });
            return new Response('Unauthorized', { status: 401 });
        }

        event.locals.user = result.user;
    }

    // Existing app route protection
    if (event.url.pathname.startsWith('/app')) {
        // Always check session and set user data if valid
        if (session) {
            const result = await authServer.validateSession(session);
            if (result) {
                event.locals.user = result.user;
                // Make user data available to client
                return resolve(event);
            } else {
                event.cookies.delete('session', { path: '/' });
            }
        }

        // If we get here, either there was no session or it was invalid
        throw redirect(302, '/login');
    }

    return resolve(event);
};

// 2. CORS Handler - Handle API requests
const handleCORS: Handle = async ({ event, resolve }) => {
    const origin = event.request.headers.get('Origin');
    const allowedOrigins = PUBLIC_ALLOWED_ORIGINS.split(',').map(o => o.trim());

    // For API routes, handle CORS
    if (event.url.pathname.startsWith('/api')) {
        const headers = new Headers();

        // If origin is in allowed list, set CORS headers
        if (origin && allowedOrigins.includes(origin)) {
            headers.set('Access-Control-Allow-Origin', origin);
            headers.set('Access-Control-Allow-Credentials', 'true');
            headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
            headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            headers.set('Vary', 'Origin'); // Important for caching
        }

        // Handle preflight requests
        if (event.request.method === 'OPTIONS') {
            return new Response(null, {
                headers,
                status: 204
            });
        }

        // Handle actual requests
        const response = await resolve(event);
        const newHeaders = new Headers(response.headers);

        // Add CORS headers to the response
        if (origin && allowedOrigins.includes(origin)) {
            headers.forEach((value, key) => {
                newHeaders.set(key, value);
            });
        }

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    }

    return resolve(event);
};

// 3. Combine handlers in sequence
export const handle = sequence(logRequests, handleAuth, handleCORS);
