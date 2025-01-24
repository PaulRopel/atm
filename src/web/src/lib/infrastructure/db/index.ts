import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient, type Config } from '@libsql/client';

// Get database config based on environment
const dbConfig = {
    url: (dev ? env.DATABASE_URL : process.env.DATABASE_URL) || 'file:local.db',
    authToken: dev ? env.DATABASE_AUTH_TOKEN : process.env.DATABASE_AUTH_TOKEN
} satisfies Config;

const client = createClient(dbConfig);

export const db = drizzle(client);

// Log connection status
client.execute('SELECT 1')
    .then(() => console.log('DB connected:', dbConfig.url))
    .catch(err => console.error('DB connection failed:', err)); 