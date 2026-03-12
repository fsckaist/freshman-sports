import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './src/lib/server/db/schema.ts';
import { eq, and, asc, or } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function check() {
    try {
        const allSports = await db.select().from(schema.sports).orderBy(asc(schema.sports.displayOrder));
        if (allSports.length === 0) {
            console.log("No sports found");
            return;
        }
        let activeSport = allSports[0];
        console.log("Active sport:", activeSport.name);

        const rawSchedules = await db.select()
            .from(schema.schedules)
            .where(eq(schema.schedules.sportId, activeSport.id))
            .orderBy(asc(schema.schedules.startTime));

        console.log("Schedules count:", rawSchedules.length);

        const dateKeys = Array.from(new Set(rawSchedules.map(rs => {
            const d = rs.startTime;
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }))).sort();
        console.log("Date keys:", dateKeys);

        const pendingMatchesRaw = await db.select({
            match: schema.matches,
            sport: schema.sports,
        })
            .from(schema.matches)
            .innerJoin(schema.sports, eq(schema.matches.sportId, schema.sports.id))
            .where(
                and(
                    eq(schema.matches.sportId, activeSport.id),
                    eq(schema.matches.status, 'PENDING_SCHEDULE')
                )
            );
        console.log("Pending matches raw count:", pendingMatchesRaw.length);

        const allClassesRaw = await db.select().from(schema.classes);
        const classMap = new Map(allClassesRaw.map(c => [c.id, c.classNumber]));

        const pendingMatches = pendingMatchesRaw.map(r => ({
            id: r.match.id,
            sportName: r.sport.name,
            classA: r.match.classAId ? classMap.get(r.match.classAId) : null,
            classB: r.match.classBId ? classMap.get(r.match.classBId) : null,
            classAId: r.match.classAId,
            classBId: r.match.classBId
        }));
        console.log("Pending matches processed successfully");

        console.log("Check complete - no errors found in major blocks");
    } catch (e) {
        console.error("ERROR DETECTED:", e);
    } finally {
        await client.end();
    }
}

check();
