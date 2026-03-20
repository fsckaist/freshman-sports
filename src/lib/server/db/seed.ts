import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { eq, and, or } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
    console.log("🌱 Starting Database Seed (Improved)...");

    try {
        // --- 1. Clean Up ---
        console.log("🧹 Cleaning up old data...");
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
        console.log("✨ Cleanup complete.");

        // --- 2. system_config ---
        console.log("⚙️  Inserting system_config...");
        await db.insert(schema.system_config).values({
            eventState: 'REGISTRATION',
            registrationDeadline: new Date("2026-03-15T23:59:59")
        });

        // --- 3. Classes (31) ---
        console.log("🏫 Inserting 31 Classes...");
        const insertedClasses = await db.insert(schema.classes)
            .values(Array.from({ length: 31 }, (_, i) => ({ classNumber: i + 1 })))
            .returning();

        // Dates for seeding (interpreted as local time)
        const march13 = new Date("2026-03-13T00:00:00");
        const march20 = new Date("2026-03-20T23:59:59");
        const march31 = new Date("2026-03-31T23:59:59");

        // --- 4. Sports ---
        console.log("⚽ Inserting Sports with Periods...");
        const insertedSports = await db.insert(schema.sports).values([
            {
                name: "풋살",
                slug: "futsal",
                minPlayers: 5,
                maxPlayers: 10,
                displayOrder: 1,
                dailyStartTime: "10:00",
                dailyEndTime: "16:00",
                timeSlotInterval: 60,
                maxParallelMatches: 1,
                periodStart: march13,
                periodEnd: march31,
                round1SelectionStart: march13,
                round1SelectionEnd: march20,
                round1Deadline: march20,
                recordStructure: [
                    { key: "half1", label: "전반", stats: [{ key: "score", label: "득점" }, { key: "foul", label: "파울" }] },
                    { key: "half2", label: "후반", stats: [{ key: "score", label: "득점" }, { key: "foul", label: "파울" }] },
                    { key: "penalty", label: "승부차기", stats: [{ key: "score", label: "득점" }] }
                ]
            },
            {
                name: "농구",
                slug: "basketball",
                minPlayers: 3,
                maxPlayers: 8,
                displayOrder: 2,
                dailyStartTime: "10:00",
                dailyEndTime: "16:00",
                timeSlotInterval: 60,
                maxParallelMatches: 1,
                periodStart: march13,
                periodEnd: march31,
                round1SelectionStart: march13,
                round1SelectionEnd: march20,
                round1Deadline: march20,
                recordStructure: [
                    { key: "half1", label: "전반", stats: [{ key: "score", label: "득점" }, { key: "foul", label: "파울" }] },
                    { key: "half2", label: "후반", stats: [{ key: "score", label: "득점" }, { key: "foul", label: "파울" }] }
                ]
            },
            {
                name: "남자 배드민턴 복식",
                slug: "badminton-m",
                minPlayers: 2,
                maxPlayers: 4,
                displayOrder: 3,
                dailyStartTime: "10:00",
                dailyEndTime: "16:00",
                timeSlotInterval: 30,
                maxParallelMatches: 2,
                periodStart: march13,
                periodEnd: march31,
                round1SelectionStart: march13,
                round1SelectionEnd: march20,
                round1Deadline: march20,
                requiredGender: 'MALE_ONLY',
                recordStructure: [
                    { key: "set1", label: "1세트", stats: [{ key: "score", label: "득점" }] },
                    { key: "set2", label: "2세트", stats: [{ key: "score", label: "득점" }] },
                    { key: "set3", label: "3세트", stats: [{ key: "score", label: "득점" }] }
                ]
            },
            {
                name: "여자 배드민턴 복식",
                slug: "badminton-w",
                minPlayers: 2,
                maxPlayers: 4,
                displayOrder: 4,
                dailyStartTime: "10:00",
                dailyEndTime: "16:00",
                timeSlotInterval: 30,
                maxParallelMatches: 2,
                periodStart: march13,
                periodEnd: march31,
                round1SelectionStart: march13,
                round1SelectionEnd: march20,
                round1Deadline: march20,
                requiredGender: 'FEMALE_ONLY',
                recordStructure: [
                    { key: "set1", label: "1세트", stats: [{ key: "score", label: "득점" }] },
                    { key: "set2", label: "2세트", stats: [{ key: "score", label: "득점" }] },
                    { key: "set3", label: "3세트", stats: [{ key: "score", label: "득점" }] }
                ]
            }
        ]).returning();

        // --- 4.5. Sport Locations ---
        console.log("📍 Inserting default sport locations...");
        const locationData: typeof schema.sport_locations.$inferInsert[] = [];
        for (const sport of insertedSports) {
            if (sport.slug === 'futsal') {
                locationData.push({ sportId: sport.id, name: '풋살장 A' });
                locationData.push({ sportId: sport.id, name: '풋살장 B' });
            } else if (sport.slug === 'basketball') {
                locationData.push({ sportId: sport.id, name: '실내체육관 농구장' });
                locationData.push({ sportId: sport.id, name: '야외 농구장' });
            } else {
                locationData.push({ sportId: sport.id, name: '체육관 코트 1' });
                locationData.push({ sportId: sport.id, name: '체육관 코트 2' });
                locationData.push({ sportId: sport.id, name: '체육관 코트 3' });
            }
        }
        await db.insert(schema.sport_locations).values(locationData);

        // --- 5. Users ---
        console.log("👤 Inserting Users (Role-based Student Numbers)...");
        const usersToInsert: typeof schema.users.$inferInsert[] = [];

        // 1. Admin (2022...)
        usersToInsert.push({
            name: "총관리자",
            studentNumber: "20250474",
            email: "twooyu@kaist.ac.kr",
            isAdmin: true,
            isManager: true,
            agreedPrivacy: false,
            agreedRules: false,
            gender: 'MALE'
        });

        // 2. Managers (2023...) - 10 users
        for (let i = 1; i <= 10; i++) {
            usersToInsert.push({
                name: `매니저_${i}`,
                studentNumber: `2023${i.toString().padStart(4, '0')}`,
                email: `manager_${i}@kaist.ac.kr`,
                isManager: true,
                agreedPrivacy: false,
                agreedRules: false,
                gender: i % 2 === 0 ? 'FEMALE' : 'MALE'
            });
        }

        // 3. Referees (2024...) - 50 users
        for (let i = 1; i <= 50; i++) {
            usersToInsert.push({
                name: `심판_${i}`,
                studentNumber: `2024${i.toString().padStart(4, '0')}`,
                email: `referee_${i}@kaist.ac.kr`,
                isReferee: true,
                agreedPrivacy: false,
                agreedRules: false,
                gender: i % 2 === 0 ? 'FEMALE' : 'MALE'
            });
        }

        // 4. Per-Class Users: Proctors (2025...) and Students (2026...)
        for (const c of insertedClasses) {
            // 2 Proctors per class
            for (let i = 1; i <= 2; i++) {
                usersToInsert.push({
                    name: `프락터_${c.classNumber}반_${i}`,
                    studentNumber: `2025${c.classNumber.toString().padStart(2, '0')}${i.toString().padStart(2, '0')}`,
                    email: `proctor_${c.classNumber}_${i}@kaist.ac.kr`,
                    classId: c.id,
                    isProctor: true,
                    agreedPrivacy: false,
                    agreedRules: false,
                    gender: i === 1 ? 'MALE' : 'FEMALE'
                });
            }

            // 10 Students per class
            for (let i = 1; i <= 10; i++) {
                usersToInsert.push({
                    name: `학생_${c.classNumber}반_${i}`,
                    studentNumber: `2026${c.classNumber.toString().padStart(2, '0')}${i.toString().padStart(2, '0')}`,
                    email: `student_${c.classNumber}_${i}@kaist.ac.kr`,
                    classId: c.id,
                    agreedPrivacy: false,
                    agreedRules: false,
                    gender: i <= 5 ? 'MALE' : 'FEMALE' // 5 Male, 5 Female
                });
            }
        }

        const batchSize = 100;
        let insertedUsers: typeof schema.users.$inferSelect[] = [];
        for (let i = 0; i < usersToInsert.length; i += batchSize) {
            const rows = await db.insert(schema.users).values(usersToInsert.slice(i, i + batchSize)).returning();
            insertedUsers = insertedUsers.concat(rows);
        }

        // --- 6. Rosters (Every student for Every sport) ---
        console.log("📋 Adding Rosters for ALL students in ALL sports...");
        const rosterInserts: typeof schema.rosters.$inferInsert[] = [];
        // Only regular students and proctors participate in sports
        const participants = insertedUsers.filter(u => u.classId && (u.isProctor || (!u.isAdmin && !u.isManager && !u.isReferee)));

        for (const sport of insertedSports) {
            for (const participant of participants) {
                rosterInserts.push({
                    userId: participant.id,
                    classId: participant.classId!,
                    sportId: sport.id
                });
            }
        }

        for (let i = 0; i < rosterInserts.length; i += batchSize) {
            await db.insert(schema.rosters).values(rosterInserts.slice(i, i + batchSize));
        }

        // --- 7. Brackets & Matches ---
        await seedBrackets(insertedClasses, insertedSports);

        // --- 8. Initial Schedules (Skipped as requested) ---
        console.log("📅 Skipping initial schedules (keep table empty)...");

        // --- 9. Initial Votes (Skipped as requested) ---
        console.log("🗳️  Skipping initial votes (keep table empty)...");

        console.log("✅ Seed complete!");
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

async function seedBrackets(
    insertedClasses: typeof schema.classes.$inferSelect[],
    insertedSports: typeof schema.sports.$inferSelect[]
) {
    console.log("🏆 Seeding Brackets & Matches...");
    const bracketNodes: typeof schema.tournament_brackets.$inferInsert[] = [];

    for (const sport of insertedSports) {
        const round1: typeof schema.matches.$inferInsert[] = [];
        for (let i = 0; i < 16; i++) {
            const aIdx = i * 2;
            const bIdx = i * 2 + 1;
            round1.push({
                sportId: sport.id,
                classAId: aIdx < 31 ? insertedClasses[aIdx].id : null,
                classBId: bIdx < 31 ? insertedClasses[bIdx].id : null,
                status: 'PENDING_SCHEDULE',
                name: `R32-M${i + 1}`,
                scoreA: 0,
                scoreB: 0
            });
        }
        const inserted = await db.insert(schema.matches).values(round1).returning();

        for (let i = 0; i < 16; i++) {
            const aIdx = i * 2;
            const bIdx = i * 2 + 1;
            bracketNodes.push({
                sportId: sport.id, round: 1, position: aIdx,
                classId: aIdx < 31 ? insertedClasses[aIdx].id : null,
                matchId: inserted[i].id,
                isEliminatedSlot: aIdx >= 31, status: 'default'
            });
            bracketNodes.push({
                sportId: sport.id, round: 1, position: bIdx,
                classId: bIdx < 31 ? insertedClasses[bIdx].id : null,
                matchId: inserted[i].id,
                isEliminatedSlot: bIdx >= 31, status: 'default'
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
