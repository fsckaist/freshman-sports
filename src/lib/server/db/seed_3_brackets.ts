import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';

// DB_LOCK 체크: true이면 DB 세팅 스크립트 실행을 차단
if (process.env.DB_LOCK === 'true') {
    console.error("❌ DB_LOCK is enabled. Database seeding is blocked.");
    console.error("   Set DB_LOCK=false in .env to allow seeding.");
    process.exit(1);
}

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
    console.log("Starting Database Seed - 3. Brackets and Matches...");

    try {
        // --- 1. Clean Up ---
        console.log("Cleaning up old tournament data...");
        await db.delete(schema.tournament_brackets);
        await db.delete(schema.matches);

        // --- 2. Fetch existing data ---
        const insertedClasses = await db.select().from(schema.classes);
        const insertedSports = await db.select().from(schema.sports);

        if (insertedClasses.length === 0 || insertedSports.length === 0) {
            console.error("Need to run setup and users seed first (Classes or Sports not found).");
            process.exit(1);
        }

        // --- 3. Brackets & Matches ---
        await seedBrackets(insertedClasses, insertedSports);

        // --- 4. Initial Schedules & Votes (Skipped as requested) ---
        console.log("Skipping initial schedules (keep table empty)...");
        console.log("Skipping initial votes (keep table empty)...");

        console.log("Brackets and Matches Setup complete!");
    } catch (error) {
        console.error("Brackets Setup failed:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

async function seedBrackets(
    insertedClasses: typeof schema.classes.$inferSelect[],
    insertedSports: typeof schema.sports.$inferSelect[]
) {
    const isDemo = process.env.IS_DEMO === 'true';
    const csvFileName = isDemo ? 'bracket_demo.csv' : 'bracket.csv';
    console.log(`Seeding Brackets & Matches from ../data/${csvFileName}...`);
    const csvPath = path.resolve(process.cwd(), `../data/${csvFileName}`);
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').map(l => l.trim()).filter(l => l !== '');

    // Parse header and map column index to sport slug
    const header = lines.shift()!.split(',');
    // Fix typo in CSV header if present
    const sportSlugs = header.map(s => s.trim());

    // Parse matrix
    const matrix: (number | null)[][] = lines.map(line => {
        return line.split(',').map(s => {
            const val = parseInt(s.trim());
            return isNaN(val) ? null : val;
        });
    });

    const bracketNodes: typeof schema.tournament_brackets.$inferInsert[] = [];

    for (const sport of insertedSports) {
        const colIdx = sportSlugs.indexOf(sport.slug);
        if (colIdx === -1) {
            console.warn(`No bracket data found for sport ${sport.slug}, skipping...`);
            continue;
        }

        const round1: typeof schema.matches.$inferInsert[] = [];
        for (let i = 0; i < 16; i++) {
            const r1 = i * 2;
            const r2 = i * 2 + 1;

            const classNumA = r1 < matrix.length ? matrix[r1][colIdx] : null;
            const classNumB = r2 < matrix.length ? matrix[r2][colIdx] : null;

            const classAId = classNumA ? insertedClasses.find(c => c.classNumber === classNumA)?.id || null : null;
            const classBId = classNumB ? insertedClasses.find(c => c.classNumber === classNumB)?.id || null : null;

            round1.push({
                sportId: sport.id,
                classAId: classAId,
                classBId: classBId,
                status: 'PENDING_SCHEDULE',
                name: JSON.stringify({ ko: `R32-M${i + 1}`, en: `R32-M${i + 1}` }),
                scoreA: 0,
                scoreB: 0
            });
        }
        const inserted = await db.insert(schema.matches).values(round1).returning();

        for (let i = 0; i < 16; i++) {
            const r1 = i * 2;
            const r2 = i * 2 + 1;

            const classNumA = r1 < matrix.length ? matrix[r1][colIdx] : null;
            const classNumB = r2 < matrix.length ? matrix[r2][colIdx] : null;

            const classAId = classNumA ? insertedClasses.find(c => c.classNumber === classNumA)?.id || null : null;
            const classBId = classNumB ? insertedClasses.find(c => c.classNumber === classNumB)?.id || null : null;

            bracketNodes.push({
                sportId: sport.id, round: 1, position: r1,
                classId: classAId,
                matchId: inserted[i].id,
                isEliminatedSlot: !classAId,
                status: 'default'
            });
            bracketNodes.push({
                sportId: sport.id, round: 1, position: r2,
                classId: classBId,
                matchId: inserted[i].id,
                isEliminatedSlot: !classBId,
                status: 'default'
            });
        }

        const rounds = [{ r: 2, n: 16 }, { r: 3, n: 8 }, { r: 4, n: 4 }, { r: 5, n: 4 }, { r: 6, n: 3 }];
        for (const { r, n } of rounds) {
            for (let pos = 0; pos < n; pos++) {
                bracketNodes.push({ sportId: sport.id, round: r, position: pos, classId: null, matchId: null, isEliminatedSlot: false, status: 'default' });
            }
        }
    }

    for (let i = 0; i < bracketNodes.length; i += 100) {
        await db.insert(schema.tournament_brackets).values(bracketNodes.slice(i, i + 100));
    }
}

main();
