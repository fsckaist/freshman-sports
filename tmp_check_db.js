const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config();

// Use the database URL from process.env.DATABASE_URL
const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function check() {
    try {
        // We just query directly using raw sql if we don't want to deal with schema imports in a script
        const resultSports = await db.execute('SELECT * FROM sports');
        const resultMatches = await db.execute("SELECT * FROM matches WHERE status = 'PENDING_SCHEDULE'");
        const resultBrackets = await db.execute('SELECT * FROM tournament_brackets');

        console.log('--- SPORTS ---');
        console.log(JSON.stringify(resultSports, null, 2));

        console.log('\n--- PENDING MATCHES ---');
        console.log(JSON.stringify(resultMatches, null, 2));

        console.log('\n--- BRACKETS ---');
        console.log(JSON.stringify(resultBrackets, null, 2));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
