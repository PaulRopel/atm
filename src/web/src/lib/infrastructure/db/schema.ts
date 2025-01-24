import { sql } from 'drizzle-orm'
import { text, sqliteTable } from 'drizzle-orm/sqlite-core'

export const user = sqliteTable('user', {
    id: text('id').primaryKey().default(sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`),
    name: text('name').notNull(),
    email: text('email').unique().notNull(),
    password_hash: text('password_hash').notNull(),
    role: text('role').notNull(),
})

export const session = sqliteTable('session', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id),
    expiresAt: text('expires_at').notNull(),
    createdAt: text('created_at').notNull()
})

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;