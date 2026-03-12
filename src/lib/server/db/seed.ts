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
        await db.insert(schema.system_config).values({ eventState: 'ONGOING' });

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
                round1Deadline: march20
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
                round1Deadline: march20
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
                round1Deadline: march20
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
                round1Deadline: march20
            }
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

        // Add admin/manager/referee
        usersToInsert.push({
            name: "관리자",
            studentNumber: "20230001",
            email: "admin@kaist.ac.kr",
            isAdmin: true,
            isManager: true,
            agreedPrivacy: true,
            agreedRules: true
        });

        const batchSize = 100;
        let insertedUsers: typeof schema.users.$inferSelect[] = [];
        for (let i = 0; i < usersToInsert.length; i += batchSize) {
            const rows = await db.insert(schema.users).values(usersToInsert.slice(i, i + batchSize)).returning();
            insertedUsers = insertedUsers.concat(rows);
        }

        // --- 6. Rosters (Every student for Every sport) ---
        console.log("📋 Adding Rosters for ALL students in ALL sports...");
        const rosterInserts: typeof schema.rosters.$inferInsert[] = [];
        const students = insertedUsers.filter(u => u.classId && !u.isProctor && !u.isAdmin && !u.isReferee);

        for (const sport of insertedSports) {
            for (const student of students) {
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

        // --- 7. Brackets & Matches ---
        await seedBrackets(insertedClasses, insertedSports);

        // --- 8. Initial Schedules (First Week) ---
        console.log("📅 Generating Initial Schedules...");
        const scheduleInserts: typeof schema.schedules.$inferInsert[] = [];
        for (const sport of insertedSports) {
            let cursor = new Date(march13);
            cursor.setHours(10, 0, 0, 0);

            // 7 days
            for (let d = 0; d < 7; d++) {
                // Skip weekends for coordination
                if (cursor.getDay() !== 0 && cursor.getDay() !== 6) {
                    for (let h = 0; h < 6; h++) { // 10:00 to 16:00
                        scheduleInserts.push({
                            sportId: sport.id,
                            startTime: new Date(cursor),
                            isAvailable: true
                        });
                        cursor.setMinutes(cursor.getMinutes() + sport.timeSlotInterval!);
                    }
                    // Reset to 10:00 next day
                    cursor.setHours(10, 0, 0, 0);
                }
                cursor.setDate(cursor.getDate() + 1);
            }
        }

        const insertedSchedules = await db.insert(schema.schedules).values(scheduleInserts).returning();

        // --- 9. Initial Votes (Pre-filled for Round 1) ---
        console.log("🗳️  Pre-filling Votes for Round 1 Matches...");
        const registerInserts: typeof schema.registers.$inferInsert[] = [];

        // Find Round 1 matches
        const round1Matches = await db.select().from(schema.matches).where(eq(schema.matches.status, 'PENDING_SCHEDULE'));

        for (const match of round1Matches) {
            const sport = insertedSports.find(s => s.id === match.sportId)!;
            const slots = insertedSchedules.filter(s => s.sportId === sport.id);

            // Select half of the slots randomly or sequentially
            const slotsToVote = slots.slice(0, Math.ceil(slots.length / 2));

            // Get students for classA and classB
            const classAStudents = students.filter(s => s.classId === match.classAId).slice(0, sport.minPlayers!);
            const classBStudents = students.filter(s => s.classId === match.classBId).slice(0, sport.minPlayers!);

            for (const slot of slotsToVote) {
                // Have some members from each team vote for this slot
                for (const student of [...classAStudents, ...classBStudents]) {
                    // Randomly decide if this student votes for this slot to make it look realistic
                    if (Math.random() > 0.3) {
                        registerInserts.push({
                            userId: student.id,
                            classId: student.classId!,
                            scheduleId: slot.id,
                            isAvailable: true
                        });
                    }
                }
            }
        }

        for (let i = 0; i < registerInserts.length; i += batchSize) {
            await db.insert(schema.registers).values(registerInserts.slice(i, i + batchSize));
        }

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
