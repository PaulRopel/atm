import type { AuthResult } from './types';
import type { LoginFormData, RegisterFormData } from '$lib/schemas/auth';
import { authStore } from '$lib/stores/auth.store';
import { PUBLIC_API_URL, PUBLIC_API_BASE } from '$env/static/public';

export class AuthClient {
    private baseUrl: string;
    private fetch: typeof fetch;

    constructor(customFetch?: typeof fetch) {
        this.fetch = customFetch || fetch;

        const apiBase = PUBLIC_API_BASE;
        const apiUrl = PUBLIC_API_URL;

        if (!apiUrl || !apiBase) {
            throw new Error('Missing required environment variables: PUBLIC_API_URL or PUBLIC_API_BASE');
        }

        try {
            const isStatic = import.meta.env?.VITE_ADAPTER === 'static';
            // For static builds, always use the full URL
            this.baseUrl = isStatic ? `${apiUrl}${apiBase}` : apiBase;

            console.log('Auth Client initialized with:', {
                apiBase,
                apiUrl,
                baseUrl: this.baseUrl,
                isStatic,
                mode: import.meta.env?.MODE || 'unknown'
            });
        } catch {
            // Fallback if import.meta.env is not available
            this.baseUrl = apiBase;
        }
    }

    async register(data: RegisterFormData): Promise<AuthResult> {
        const response = await this.fetch(`${this.baseUrl}/auth/register`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        const result = await response.json();
        return result;
    }

    async login(data: LoginFormData): Promise<AuthResult> {
        const url = `${this.baseUrl}/auth/login`;
        console.log('Login attempt:', { url });

        const response = await this.fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Login failed:', {
                status: response.status,
                headers: Object.fromEntries(response.headers.entries()),
                error: result.error
            });
            throw new Error(result.error || 'Authentication failed');
        }

        if (result.user) {
            authStore.setUser(result.user);
        }
        return result;
    }

    async checkSession(): Promise<AuthResult> {
        const response = await this.fetch(`${this.baseUrl}/auth/session`, {
            credentials: 'include'
        });

        const result = await response.json();

        if (!response.ok) {
            authStore.clearUser();
            throw new Error(result.error || 'Session invalid');
        }

        if (result.user) {
            authStore.setUser(result.user);
        }
        return result;
    }

    async logout(): Promise<void> {
        try {
            console.log('Logout URL:', `${this.baseUrl}/auth/session`);  // Debug log

            const response = await this.fetch(`${this.baseUrl}/auth/session`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error('Logout failed:', response.status);
                throw new Error('Logout failed');
            }

            await response.json();  // Consume the response

        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        } finally {
            // Always clear local state
            authStore.clearUser();
        }
    }
}

export const authClient = new AuthClient(); 