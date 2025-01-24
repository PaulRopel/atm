import { loginUserSchema } from '$lib/schemas/auth';
import type { RequestHandler } from './$types';
import { AuthServer } from '$lib/domain/auth/auth.server';
import { AuthRepository } from '$lib/domain/auth/auth.repository';

const authServer = new AuthServer(new AuthRepository());

export const POST: RequestHandler = async ({ request }) => {
    try {
        const headers = new Headers({
            'Content-Type': 'application/json'
        });

        const body = await request.json();
        console.log('1. Received request body:', body);

        const result = loginUserSchema.safeParse(body);
        if (!result.success) {
            console.log('2. Validation failed:', result.error);
            return new Response(JSON.stringify({
                error: 'Validation failed',
                details: result.error.errors
            }), {
                status: 400,
                headers
            });
        }

        console.log('3. Attempting login with:', result.data);
        const loginResult = await authServer.login(result.data);
        console.log('4. Auth server response:', loginResult);

        if (!loginResult) {
            return new Response(JSON.stringify({
                error: 'Invalid credentials'
            }), {
                status: 401,
                headers
            });
        }

        // Set session cookie
        const setCookieHeader = `session=${loginResult.sessionId}; Path=/; HttpOnly; SameSite=Lax`;
        headers.set('Set-Cookie', setCookieHeader);

        const responseBody = { user: loginResult.user };
        console.log('5. About to send response:', {
            body: responseBody,
            headers: Object.fromEntries(headers.entries())
        });

        return new Response(JSON.stringify(responseBody), {
            status: 200,
            headers
        });
    } catch (error) {
        console.error('Server error:', {
            error,
            stack: error instanceof Error ? error.stack : undefined,
            message: error instanceof Error ? error.message : 'Unknown error'
        });

        return new Response(JSON.stringify({
            error: 'Authentication failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        });
    }
}; 