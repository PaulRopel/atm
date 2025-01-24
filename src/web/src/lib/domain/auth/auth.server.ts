import { AuthRepository } from './auth.repository';
import type { User, LoggedInUser } from './types';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';

export class AuthServer {
    constructor(private repository: AuthRepository) { }

    async register(userData: { email: string; password: string; name: string }): Promise<User> {
        const password_hash = encodeHexLowerCase(
            sha256(new TextEncoder().encode(userData.password))
        );

        return this.repository.createUser({
            email: userData.email,
            name: userData.name,
            password_hash,
            role: 'user' as const
        });
    }

    async login(credentials: { email: string; password: string }): Promise<{ user: LoggedInUser; sessionId: string } | null> {
        console.log('Looking up user:', credentials.email);
        const user = await this.repository.findUserByEmail(credentials.email);

        if (!user) {
            console.log('User not found');
            return null;
        }

        const hashedPassword = encodeHexLowerCase(
            sha256(new TextEncoder().encode(credentials.password))
        );
        console.log('Password verification:', {
            provided: hashedPassword,
            stored: user.password_hash,
            matches: hashedPassword === user.password_hash
        });

        if (hashedPassword !== user.password_hash) {
            console.log('Password mismatch');
            return null;
        }

        console.log('Creating session for user:', user.id);
        const session = await this.repository.createSession(user.id);

        // Transform to LoggedInUser before returning
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash: _ph, ...loggedInUser } = user;
        console.log('Login successful:', { userId: user.id, sessionId: session.id });

        return { user: loggedInUser, sessionId: session.id };
    }

    async validateSession(sessionId: string): Promise<{ user: LoggedInUser } | null> {
        const session = await this.repository.getSession(sessionId);
        if (!session) return null;

        const user = await this.repository.getUserById(session.userId);
        if (!user) return null;
        // Transform to LoggedInUser before returning
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash: _ph, ...loggedInUser } = user;
        return { user: loggedInUser };
    }

    async logout(sessionId: string): Promise<void> {
        await this.repository.deleteSession(sessionId);
    }
} 