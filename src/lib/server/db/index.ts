import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

// In seed scripts we won't have $env/dynamic/private loaded, so we define a fallback
const connectionString = process.env.DATABASE_URL || env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';

// Setup postgres client
const client = postgres(connectionString);

// Export standalone sql for raw queries
export const sql = client;

// Export drizzle wrapped db instance exposing our schema
export const db = drizzle(client, { schema });
