import { db } from '$lib/infrastructure/db';
import { user, session } from '$lib/infrastructure/db/schema';
import type { Session } from '$lib/infrastructure/db/schema';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import type { User } from './types';

export class AuthRepository {
    async createUser(userData: { email: string; password_hash: string; name: string; role: 'user' | 'admin' }): Promise<User> {
        const [newUser] = await db.insert(user)
            .values({
                ...userData,
                id: randomUUID(),
            })
            .returning();

        return newUser as User;
    }

    async findUserByEmail(email: string): Promise<User | undefined> {
        const [foundUser] = await db.select()
            .from(user)
            .where(eq(user.email, email));
        return foundUser as User;
    }

    async createSession(userId: string): Promise<Session> {
        const [newSession] = await db.insert(session)
            .values({
                id: randomUUID(),
                userId,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString()
            })
            .returning();
        return newSession;
    }

    async getSession(sessionId: string): Promise<Session | undefined> {
        const [foundSession] = await db.select()
            .from(session)
            .where(eq(session.id, sessionId));
        return foundSession;
    }

    async deleteSession(sessionId: string): Promise<void> {
        await db.delete(session)
            .where(eq(session.id, sessionId));
    }

    async getUserById(userId: string): Promise<User | undefined> {
        const [foundUser] = await db.select()
            .from(user)
            .where(eq(user.id, userId));
        return foundUser as User;
    }
} 