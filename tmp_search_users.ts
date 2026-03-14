import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './src/lib/server/db/schema.ts';
import { eq } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
    try {
        const studentNumbers = ['20230001', '20230005', '20260101'];
        for (const num of studentNumbers) {
            const user = await db.query.users.findFirst({
                where: (u, { eq }) => eq(u.studentNumber, num)
            });
            console.log(`User ${num}:`, user ? user.name : 'NOT FOUND');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

main();
