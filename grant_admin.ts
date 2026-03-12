import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './src/lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const managers = await db.select({
    id: schema.users.id,
    name: schema.users.name,
    studentNumber: schema.users.studentNumber
}).from(schema.users).where(eq(schema.users.isManager, true));

managers.sort((a, b) => (a.studentNumber ?? '').localeCompare(b.studentNumber ?? ''));
const first = managers[0];
if (!first) { console.log('No managers found'); process.exit(1); }

console.log(`Granting isAdmin to: ${first.name} (${first.studentNumber})`);
await db.update(schema.users).set({ isAdmin: true }).where(eq(schema.users.id, first.id));
console.log('Done!');
await client.end();
process.exit(0);
