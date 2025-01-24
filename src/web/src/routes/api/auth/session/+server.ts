import type { RequestHandler } from './$types';
import { AuthServer } from '$lib/domain/auth/auth.server';
import { AuthRepository } from '$lib/domain/auth/auth.repository';

const authServer = new AuthServer(new AuthRepository());

// GET session check
export const GET: RequestHandler = async ({ cookies }) => {
    const session = cookies.get('session');
    const headers = new Headers({
        'Content-Type': 'application/json'
    });

    if (!session) {
        return new Response(JSON.stringify({ error: 'No session' }), {
            status: 401,
            headers
        });
    }

    const result = await authServer.validateSession(session);
    if (!result) {
        cookies.delete('session', { path: '/' });
        return new Response(JSON.stringify({ error: 'Invalid session' }), {
            status: 401,
            headers
        });
    }

    return new Response(JSON.stringify({ user: result.user }), {
        status: 200,
        headers
    });
};

// DELETE session (logout)
export const DELETE: RequestHandler = async ({ cookies }) => {
    const session = cookies.get('session');
    const headers = new Headers({
        'Content-Type': 'application/json'
    });

    if (session) {
        // Delete session from database
        await authServer.logout(session);
        // Remove cookie
        cookies.delete('session', { path: '/' });
    }

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers
    });
};

export const OPTIONS: RequestHandler = async ({ request }) => {
    const origin = request.headers.get('Origin') || request.headers.get('Referer') || '*';

    const headers = new Headers({
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true'
    });

    return new Response(null, { headers });
}; 