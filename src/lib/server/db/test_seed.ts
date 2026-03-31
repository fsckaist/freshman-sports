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

    const registrationDeadline = new Date();
    const startPeriod = new Date();
    const endPeriod = new Date();
    const round1SelectionPeriod = new Date();
    const round1SelectionEndPeriod = new Date();
    const round1Deadline = new Date();

    registrationDeadline.setDate(registrationDeadline.getDate() + 1);
    registrationDeadline.setHours(23, 59, 59, 999);
    startPeriod.setDate(startPeriod.getDate() + 7);
    startPeriod.setHours(0, 0, 0, 0);
    endPeriod.setDate(endPeriod.getDate() + 70);
    endPeriod.setHours(23, 59, 59, 999);
    round1SelectionPeriod.setDate(round1SelectionPeriod.getDate() + 7);
    round1SelectionPeriod.setHours(0, 0, 0, 0);
    round1SelectionEndPeriod.setDate(round1SelectionEndPeriod.getDate() + 14);
    round1SelectionEndPeriod.setHours(23, 59, 59, 999);
    round1Deadline.setDate(round1Deadline.getDate() + 5);
    round1Deadline.setHours(23, 59, 59, 999);

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
            registrationDeadline: registrationDeadline
        });

        // --- 3. Classes (31) ---
        console.log("🏫 Inserting 31 Classes...");
        const insertedClasses = await db.insert(schema.classes)
            .values(Array.from({ length: 31 }, (_, i) => ({ classNumber: i + 1 })))
            .returning();

        // --- 4. Sports ---
        console.log("⚽ Inserting Sports with Periods...");
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

        // --- 4.5. Sport Locations ---
        console.log("📍 Inserting default sport locations...");
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

        // --- 5. Users ---
        console.log("👤 Inserting Users (Role-based Student Numbers)...");
        const usersToInsert: typeof schema.users.$inferInsert[] = [];

        // 1. Admin (2022...)
        usersToInsert.push({
            name: "총관리자",
            studentNumber: "20220000",
            email: "admin@kaistfsc.org",
            isAdmin: true,
            isManager: true,
            agreedPrivacy: false,
            agreedRules: false,
            gender: null
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
                gender: null
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
                gender: null
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
                    gender: null
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
                    gender: null // 5 Male, 5 Female
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
    console.log("🏆 Seeding Brackets & Matches from ../data/bracket.csv...");
    const fs = await import('fs');
    const path = await import('path');
    const csvPath = path.resolve(process.cwd(), '../data/bracket.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').map(l => l.trim()).filter(l => l !== '');

    // Parse header and map column index to sport slug
    const header = lines.shift()!.split(',');
    // Fix typo in CSV header if present (badmintom-w -> badminton-w)
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
