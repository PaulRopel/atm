/// <reference types="node" />

import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
config({ path: '.env' }); // or .env.local

export default defineConfig({
	schema: './src/lib/infrastructure/db/schema.ts',
	driver: 'turso',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
		authToken: process.env.DATABASE_AUTH_TOKEN
	},
	verbose: true,
	strict: true,
	dialect: 'sqlite'
});
