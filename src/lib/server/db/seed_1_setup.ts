import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

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
    console.log("Starting Database Seed - 1. Basic Setup...");

    // Dates for seeding (interpreted as local time)
    const registrationDeadline = new Date("2026-04-10T23:59:59");
    const startPeriod = new Date("2026-04-27T00:00:00");
    const endPeriod = new Date("2026-06-05T23:59:59");
    const round1SelectionPeriod = new Date("2026-04-27T00:00:00");
    const round1SelectionEndPeriod = new Date("2026-05-06T23:59:59");
    const round1Deadline = new Date("2026-04-15T23:59:59");

    try {
        // --- 1. Clean Up ---
        console.log("Cleaning up old data...");
        console.log("   - Deleting tournament_brackets...");
        await db.delete(schema.tournament_brackets);
        console.log("   - Deleting registers...");
        await db.delete(schema.registers);
        console.log("   - Deleting matches...");
        await db.delete(schema.matches);
        console.log("   - Deleting schedules...");
        await db.delete(schema.schedules);
        console.log("   - Deleting rosters...");
        await db.delete(schema.rosters);
        console.log("   - Deleting sport_locations...");
        await db.delete(schema.sport_locations);
        console.log("   - Deleting users...");
        await db.delete(schema.users);
        console.log("   - Deleting sports...");
        await db.delete(schema.sports);
        console.log("   - Deleting classes...");
        await db.delete(schema.classes);
        console.log("   - Deleting system_config...");
        await db.delete(schema.system_config);
        console.log("Cleanup complete.");

        // --- 2. system_config ---
        console.log("Inserting system_config...");
        await db.insert(schema.system_config).values({
            eventState: 'REGISTRATION',
            registrationDeadline: registrationDeadline
        });

        // --- 3. Sports ---
        console.log("Inserting Sports with Periods...");
        const insertedSports = await db.insert(schema.sports).values([
            {
                name: JSON.stringify({ ko: "풋살", en: "Futsal" }),
                slug: "futsal",
                minPlayers: 5,
                maxPlayers: 10,
                displayOrder: 1,
                dailyStartTime: "15:00",
                dailyEndTime: "19:00",
                timeSlotInterval: 60,
                maxParallelMatches: 2,
                periodStart: startPeriod,
                periodEnd: endPeriod,
                round1SelectionStart: round1SelectionPeriod,
                round1SelectionEnd: round1SelectionEndPeriod,
                round1Deadline: round1Deadline,
                recordStructure: [
                    { key: "half1", label: JSON.stringify({ ko: "전반", en: "1st Half" }), stats: [{ key: "score", label: JSON.stringify({ ko: "득점", en: "Score" }) }, { key: "foul", label: JSON.stringify({ ko: "파울", en: "Foul" }) }] },
                    { key: "half2", label: JSON.stringify({ ko: "후반", en: "2nd Half" }), stats: [{ key: "score", label: JSON.stringify({ ko: "득점", en: "Score" }) }, { key: "foul", label: JSON.stringify({ ko: "파울", en: "Foul" }) }] },
                    { key: "penalty", label: JSON.stringify({ ko: "승부차기", en: "Penalty Shootout" }), stats: [{ key: "score", label: JSON.stringify({ ko: "득점", en: "Score" }) }] }
                ]
            },
            {
                name: JSON.stringify({ ko: "농구", en: "Basketball" }),
                slug: "basketball",
                minPlayers: 3,
                maxPlayers: 8,
                displayOrder: 2,
                dailyStartTime: "15:00",
                dailyEndTime: "19:00",
                timeSlotInterval: 60,
                maxParallelMatches: 2,
                periodStart: startPeriod,
                periodEnd: endPeriod,
                round1SelectionStart: round1SelectionPeriod,
                round1SelectionEnd: round1SelectionEndPeriod,
                round1Deadline: round1Deadline,
                recordStructure: [
                    { key: "half1", label: JSON.stringify({ ko: "전반", en: "1st Half" }), stats: [{ key: "score", label: JSON.stringify({ ko: "득점", en: "Score" }) }, { key: "foul", label: JSON.stringify({ ko: "파울", en: "Foul" }) }] },
                    { key: "half2", label: JSON.stringify({ ko: "후반", en: "2nd Half" }), stats: [{ key: "score", label: JSON.stringify({ ko: "득점", en: "Score" }) }, { key: "foul", label: JSON.stringify({ ko: "파울", en: "Foul" }) }] },
                    { key: "overtime", label: JSON.stringify({ ko: "연장", en: "Overtime" }), stats: [{ key: "score", label: JSON.stringify({ ko: "득점", en: "Score" }) }, { key: "foul", label: JSON.stringify({ ko: "파울", en: "Foul" }) }] }
                ]
            },
            {
                name: JSON.stringify({ ko: "남자 배드민턴 복식", en: "Men's Badminton Doubles" }),
                slug: "badminton-m",
                minPlayers: 2,
                maxPlayers: 4,
                displayOrder: 3,
                dailyStartTime: "15:00",
                dailyEndTime: "19:00",
                timeSlotInterval: 60,
                maxParallelMatches: 2,
                periodStart: startPeriod,
                periodEnd: endPeriod,
                round1SelectionStart: round1SelectionPeriod,
                round1SelectionEnd: round1SelectionEndPeriod,
                round1Deadline: round1Deadline,
                requiredGender: 'MALE_ONLY',
                recordStructure: [
                    { key: "set1", label: JSON.stringify({ ko: "1세트", en: "Set 1" }), stats: [{ key: "score", label: JSON.stringify({ ko: "득점", en: "Score" }) }] },
                    { key: "set2", label: JSON.stringify({ ko: "2세트", en: "Set 2" }), stats: [{ key: "score", label: JSON.stringify({ ko: "득점", en: "Score" }) }] },
                    { key: "set3", label: JSON.stringify({ ko: "3세트", en: "Set 3" }), stats: [{ key: "score", label: JSON.stringify({ ko: "득점", en: "Score" }) }] }
                ]
            },
            {
                name: JSON.stringify({ ko: "여자 배드민턴 복식", en: "Women's Badminton Doubles" }),
                slug: "badminton-w",
                minPlayers: 2,
                maxPlayers: 4,
                displayOrder: 4,
                dailyStartTime: "15:00",
                dailyEndTime: "19:00",
                timeSlotInterval: 60,
                maxParallelMatches: 2,
                periodStart: startPeriod,
                periodEnd: endPeriod,
                round1SelectionStart: round1SelectionPeriod,
                round1SelectionEnd: round1SelectionEndPeriod,
                round1Deadline: round1Deadline,
                requiredGender: 'FEMALE_ONLY',
                recordStructure: [
                    { key: "set1", label: JSON.stringify({ ko: "1세트", en: "Set 1" }), stats: [{ key: "score", label: JSON.stringify({ ko: "득점", en: "Score" }) }] },
                    { key: "set2", label: JSON.stringify({ ko: "2세트", en: "Set 2" }), stats: [{ key: "score", label: JSON.stringify({ ko: "득점", en: "Score" }) }] },
                    { key: "set3", label: JSON.stringify({ ko: "3세트", en: "Set 3" }), stats: [{ key: "score", label: JSON.stringify({ ko: "득점", en: "Score" }) }] }
                ]
            }
        ]).returning();

        // --- 4. Sport Locations ---
        console.log("Inserting default sport locations...");
        const locationData: typeof schema.sport_locations.$inferInsert[] = [];
        for (const sport of insertedSports) {
            if (sport.slug === 'futsal') {
                locationData.push({ sportId: sport.id, name: JSON.stringify({ ko: '교내 풋살장 A', en: 'Futsal Court A' }) });
                locationData.push({ sportId: sport.id, name: JSON.stringify({ ko: '교내 풋살장 B', en: 'Futsal Court B' }) });
            } else if (sport.slug === 'basketball') {
                locationData.push({ sportId: sport.id, name: JSON.stringify({ ko: '서측 실내체육관', en: 'West Indoor Gym Court' }) });
            } else {
                locationData.push({ sportId: sport.id, name: JSON.stringify({ ko: '스포츠 컴플렉스 주경기장', en: 'Sports Complex Main Stadium' }) });
            }
        }
        await db.insert(schema.sport_locations).values(locationData);

        console.log("Basic Setup complete!");
    } catch (error) {
        console.error("Basic Setup failed:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
