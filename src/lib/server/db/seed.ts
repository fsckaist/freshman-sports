import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
    console.log("🌱 Starting Database Seed...");

    try {
        // --- 1. Clean Up ---
        console.log("🧹 Cleaning up old data...");
        await db.delete(schema.tournament_brackets);
        await db.delete(schema.matches);
        await db.delete(schema.registers);
        await db.delete(schema.schedules);
        await db.delete(schema.rosters);
        await db.delete(schema.users);
        await db.delete(schema.sports);
        await db.delete(schema.classes);
        await db.delete(schema.system_config);

        // --- 2. system_config ---
        console.log("⚙️  Inserting system_config...");
        await db.insert(schema.system_config).values({ eventState: 'REGISTRATION' });

        // --- 3. Classes (31) ---
        console.log("🏫 Inserting 31 Classes...");
        const insertedClasses = await db.insert(schema.classes)
            .values(Array.from({ length: 31 }, (_, i) => ({ classNumber: i + 1 })))
            .returning();

        // --- 4. Sports ---
        console.log("⚽ Inserting Sports...");
        const insertedSports = await db.insert(schema.sports).values([
            { name: "풋살", slug: "futsal", minPlayers: 5, maxPlayers: 10, displayOrder: 1, dailyStartTime: "10:00", dailyEndTime: "16:00", timeSlotInterval: 60, maxParallelMatches: 1 },
            { name: "농구", slug: "basketball", minPlayers: 3, maxPlayers: 8, displayOrder: 2, dailyStartTime: "10:00", dailyEndTime: "16:00", timeSlotInterval: 60, maxParallelMatches: 1 },
            { name: "남자 배드민턴 복식", slug: "badminton-m", minPlayers: 2, maxPlayers: 4, displayOrder: 3, dailyStartTime: "10:00", dailyEndTime: "16:00", timeSlotInterval: 30, maxParallelMatches: 2 },
            { name: "여자 배드민턴 복식", slug: "badminton-w", minPlayers: 2, maxPlayers: 4, displayOrder: 4, dailyStartTime: "10:00", dailyEndTime: "16:00", timeSlotInterval: 30, maxParallelMatches: 2 }
        ]).returning();

        // --- 5. Users ---
        console.log("👤 Inserting Users...");
        const usersToInsert: typeof schema.users.$inferInsert[] = [];

        for (const c of insertedClasses) {
            for (let i = 1; i <= 10; i++) {
                usersToInsert.push({
                    name: `학생_${c.classNumber}반_${i}`,
                    studentNumber: `2026${c.classNumber.toString().padStart(2, '0')}${i.toString().padStart(2, '0')}`,
                    email: `student_${c.classNumber}_${i}@kaist.ac.kr`,
                    classId: c.id,
                    agreedPrivacy: true,
                    agreedRules: true
                });
            }
        }

        for (const c of insertedClasses) {
            for (let i = 1; i <= 2; i++) {
                usersToInsert.push({
                    name: `프락터_${c.classNumber}반_${i}`,
                    studentNumber: `2025${c.classNumber.toString().padStart(2, '0')}${i.toString().padStart(2, '0')}`,
                    email: `proctor_${c.classNumber}_${i}@kaist.ac.kr`,
                    classId: c.id,
                    isProctor: true,
                    agreedPrivacy: true,
                    agreedRules: true
                });
            }
        }

        for (let i = 1; i <= 10; i++) {
            usersToInsert.push({
                name: `심판_${i}`,
                studentNumber: `202400${i.toString().padStart(2, '0')}`,
                email: `referee_${i}@kaist.ac.kr`,
                isReferee: true,
                agreedPrivacy: true,
                agreedRules: true
            });
        }

        for (let i = 1; i <= 10; i++) {
            usersToInsert.push({
                name: `매니저_${i}`,
                studentNumber: `202300${i.toString().padStart(2, '0')}`,
                email: `manager_${i}@kaist.ac.kr`,
                isManager: true,
                isAdmin: i === 1,
                agreedPrivacy: true,
                agreedRules: true
            });
        }

        const batchSize = 100;
        let insertedUsers: typeof schema.users.$inferSelect[] = [];
        for (let i = 0; i < usersToInsert.length; i += batchSize) {
            const rows = await db.insert(schema.users).values(usersToInsert.slice(i, i + batchSize)).returning();
            insertedUsers = insertedUsers.concat(rows);
        }

        // --- 6. Rosters (1반, 2반 학생 전 종목 신청) ---
        console.log("📋 Adding initial Rosters for Class 1 and Class 2...");
        const class1Students = insertedUsers.filter(u => u.classId === insertedClasses.find(c => c.classNumber === 1)?.id && !u.isProctor);
        const class2Students = insertedUsers.filter(u => u.classId === insertedClasses.find(c => c.classNumber === 2)?.id && !u.isProctor);

        const rosterInserts: typeof schema.rosters.$inferInsert[] = [];
        for (const sport of insertedSports) {
            for (const student of [...class1Students, ...class2Students]) {
                rosterInserts.push({
                    userId: student.id,
                    classId: student.classId!,
                    sportId: sport.id
                });
            }
        }

        for (let i = 0; i < rosterInserts.length; i += batchSize) {
            await db.insert(schema.rosters).values(rosterInserts.slice(i, i + batchSize));
        }

        // --- 7. Brackets & Matches (Schedule table stays empty) ---
        await seedBrackets(insertedClasses, insertedSports);

        console.log("✅ Seed complete! (Schedule pool is empty until admin sets dates)");
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
                name: `Round 1 - Match ${i + 1}`,
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

        const rounds = [{ r: 2, n: 16 }, { r: 3, n: 8 }, { r: 4, n: 4 }, { r: 5, n: 2 }, { r: 6, n: 1 }];
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
