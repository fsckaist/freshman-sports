import { db } from './src/lib/server/db';
import { sports, matches, tournament_brackets, rosters } from './src/lib/server/db/schema';
import { eq, and, or } from 'drizzle-orm';

async function check() {
    const allSports = await db.select().from(sports);
    console.log('--- SPORTS ---');
    console.log(JSON.stringify(allSports, null, 2));

    const allMatches = await db.select().from(matches).where(eq(matches.status, 'PENDING_SCHEDULE'));
    console.log('\n--- PENDING MATCHES ---');
    console.log(JSON.stringify(allMatches, null, 2));

    const brackets = await db.select().from(tournament_brackets);
    console.log('\n--- BRACKETS ---');
    console.log(JSON.stringify(brackets, null, 2));
}

check().catch(console.error);
