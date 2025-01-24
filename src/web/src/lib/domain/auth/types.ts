import type { LoginFormData } from '$lib/schemas/auth';

export type Credentials = LoginFormData;

// Internal user type with sensitive data
export type User = {
    id: string;
    email: string;
    password_hash: string;
    name: string;
    role: 'user' | 'admin';
}

// Public user type without sensitive data
export type LoggedInUser = Omit<User, 'password_hash'>;

export type AuthResult = {
    success: boolean;
    error?: string;
    user?: LoggedInUser;  // Use LoggedInUser instead of User
} 