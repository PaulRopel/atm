import { writable } from 'svelte/store';
import type { LoggedInUser } from '$lib/domain/auth/types';

interface AuthState {
    user: LoggedInUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const createAuthStore = () => {
    const { subscribe, update } = writable<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: false
    });

    return {
        subscribe,
        setUser: (user: LoggedInUser) => update(state => ({ ...state, user, isAuthenticated: true })),
        clearUser: () => update(state => ({ ...state, user: null, isAuthenticated: false })),
        setLoading: (isLoading: boolean) => update(state => ({ ...state, isLoading }))
    };
};

export const authStore = createAuthStore(); 