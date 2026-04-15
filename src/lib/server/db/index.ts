import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import type { Logger } from 'drizzle-orm/logger';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

// 대상 작업을 필터링하여 로깅하는 커스텀 로거
class DBMutationLogger implements Logger {
    logQuery(query: string, params: unknown[]): void {
        const upperQuery = query.toUpperCase();
        if (upperQuery.startsWith('INSERT') || upperQuery.startsWith('UPDATE') || upperQuery.startsWith('DELETE')) {
            const timestamp = new Date().toISOString();
            console.log(`\n[DB Modification | ${timestamp}] ==============================`);
            console.log(`Action: ${upperQuery.split(' ')[0]}`);
            console.log(`Query:  ${query}`);
            console.log(`Params: ${JSON.stringify(params)}`);
            console.log('======================================================================\n');
        }
    }
}

// In seed scripts we won't have $env/dynamic/private loaded, so we define a fallback
const connectionString = process.env.DATABASE_URL || env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';

// Setup postgres client with connection pool settings
const client = postgres(connectionString, {
    max: 20,              // Max number of connections
    idle_timeout: 20,     // Close idle connections after 20 seconds
    connect_timeout: 10,  // Connection timeout after 10 seconds
    max_lifetime: 60 * 30 // Replace connections after 30 minutes
});

// Export standalone sql for raw queries
export const sql = client;

// Export drizzle wrapped db instance exposing our schema
export const db = drizzle(client, { schema, logger: new DBMutationLogger() });
