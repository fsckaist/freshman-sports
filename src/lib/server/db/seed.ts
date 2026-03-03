import 'dotenv/config'; // Load .env environment variables
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Required for script to run standalone
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
    console.log("🌱 Starting Database Seed...");

    try {
        // --- 1. Clean Up Existing Data ---
        console.log("🧹 Cleaning up old data...");
        // Delete in reverse order of relationships
        await db.delete(schema.matches);
        await db.delete(schema.registers);
        await db.delete(schema.schedules);
        await db.delete(schema.rosters);
        await db.delete(schema.users);
        await db.delete(schema.sports);
        await db.delete(schema.classes);

        // --- 2. Insert Classes ---
        console.log("🏫 Inserting Classes...");
        const insertedClasses = await db.insert(schema.classes).values([
            { classNumber: 1 },
            { classNumber: 99 }
        ]).returning();

        const class1 = insertedClasses.find(c => c.classNumber === 1);
        const class99 = insertedClasses.find(c => c.classNumber === 99);

        if (!class1 || !class99) throw new Error("Failed to insert classes");

        // --- 3. Insert Sports ---
        console.log("⚽ Inserting Sports...");
        const insertedSports = await db.insert(schema.sports).values([
            { name: "풋살", slug: "futsal", minPlayers: 5, maxPlayers: 10, displayOrder: 1 },
            { name: "농구", slug: "basketball", minPlayers: 3, maxPlayers: 8, displayOrder: 2 },
            { name: "남자 배드민턴 복식", slug: "badminton-m", minPlayers: 2, maxPlayers: 4, displayOrder: 3 },
            { name: "여자 배드민턴 복식", slug: "badminton-w", minPlayers: 2, maxPlayers: 4, displayOrder: 4 }
        ]).returning();

        const futsal = insertedSports.find(s => s.slug === "futsal");
        const basketball = insertedSports.find(s => s.slug === "basketball");
        const badminton = insertedSports.find(s => s.slug === "badminton-m");

        if (!futsal || !basketball || !badminton) throw new Error("Failed to insert sports");

        // --- 4. Insert Users ---
        console.log("👤 Inserting Users...");

        const usersToInsert = [];

        // 10 Students (5 for class 1, 5 for class 99)
        for (let i = 1; i <= 5; i++) {
            usersToInsert.push({
                name: `일반학생${i}`,
                studentNumber: `202610${i.toString().padStart(2, '0')}`,
                email: `student1_${i}@kaist.ac.kr`,
                classId: class1.id,
                agreedPrivacy: true,
                agreedRules: true
            });
        }
        for (let i = 1; i <= 5; i++) {
            usersToInsert.push({
                name: `구구학생${i}`,
                studentNumber: `202699${i.toString().padStart(2, '0')}`,
                email: `student99_${i}@kaist.ac.kr`,
                classId: class99.id,
                agreedPrivacy: true,
                agreedRules: true
            });
        }

        // 4 Proctors (2 for class 1, 2 for class 99)
        for (let i = 1; i <= 2; i++) {
            usersToInsert.push({
                name: `일반프락터${i}`,
                studentNumber: `202510${i.toString().padStart(2, '0')}`,
                email: `proctor1_${i}@kaist.ac.kr`,
                classId: class1.id,
                isProctor: true,
                agreedPrivacy: true,
                agreedRules: true
            });
        }
        for (let i = 1; i <= 2; i++) {
            usersToInsert.push({
                name: `구구프락터${i}`,
                studentNumber: `202599${i.toString().padStart(2, '0')}`,
                email: `proctor99_${i}@kaist.ac.kr`,
                classId: class99.id,
                isProctor: true,
                agreedPrivacy: true,
                agreedRules: true
            });
        }

        // 2 Referees
        for (let i = 1; i <= 2; i++) {
            usersToInsert.push({
                name: `심판${i}`,
                studentNumber: `202430${i.toString().padStart(2, '0')}`,
                email: `referee${i}@kaist.ac.kr`,
                isReferee: true,
                agreedPrivacy: true,
                agreedRules: true
            });
        }

        // 2 Managers
        for (let i = 1; i <= 2; i++) {
            usersToInsert.push({
                name: `매니저${i}`,
                studentNumber: `202340${i.toString().padStart(2, '0')}`,
                email: `manager${i}@kaist.ac.kr`,
                isManager: true,
                agreedPrivacy: true,
                agreedRules: true
            });
        }

        // Also keep the original specific users for matches/rosters below
        usersToInsert.push({
            name: "홍길동",
            studentNumber: "20251234",
            email: "hong@kaist.ac.kr",
            classId: class1.id,
            agreedPrivacy: true,
            agreedRules: true
        });
        usersToInsert.push({
            name: "김적수",
            studentNumber: "20259999",
            email: "kim@kaist.ac.kr",
            classId: class99.id,
            agreedPrivacy: true,
            agreedRules: true
        });

        const insertedUsers = await db.insert(schema.users).values(usersToInsert).returning();

        const hongGilDong = insertedUsers.find(u => u.name === "홍길동");
        const opponent = insertedUsers.find(u => u.name === "김적수");

        if (!hongGilDong || !opponent) throw new Error("Failed to insert core seeded users");

        // --- 5. Insert Rosters ---
        console.log("📋 Adding Users to Rosters...");
        await db.insert(schema.rosters).values([
            { userId: hongGilDong.id, classId: class1.id, sportId: futsal.id },
            { userId: hongGilDong.id, classId: class1.id, sportId: basketball.id },
            { userId: hongGilDong.id, classId: class1.id, sportId: badminton.id },

            // Opponent for matches
            { userId: opponent.id, classId: class99.id, sportId: futsal.id },
            { userId: opponent.id, classId: class99.id, sportId: basketball.id }
        ]);

        // --- 6. Insert Schedules & Matches (DYNAMIC SPREAD) ---
        console.log("🗓️ Planning Match Schedules for next 5 days...");

        const allInsertedSports = [futsal, basketball, badminton, insertedSports.find(s => s.slug === "badminton-w")!];

        const scheduleInserts = [];

        // Starting tomorrow
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() + 1);

        // Generate 5 days
        for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
            const currentDate = new Date(baseDate);
            currentDate.setDate(baseDate.getDate() + dayOffset);

            // Generate for 4 sports
            for (const sport of allInsertedSports) {
                // Generate 7 slots per day: 10:00 to 16:00
                for (let hour = 10; hour <= 16; hour++) {
                    const slotTime = new Date(currentDate);
                    slotTime.setHours(hour, 0, 0, 0);

                    // 80% true, 20% false
                    const isAvail = Math.random() < 0.8;

                    scheduleInserts.push({
                        sportId: sport.id,
                        startTime: slotTime,
                        isAvailable: isAvail
                    });
                }
            }
        }

        const insertedSchedules = await db.insert(schema.schedules).values(scheduleInserts).returning();
        const futsalSchedule = insertedSchedules.find(s => s.sportId === futsal.id)!;
        const basketballSchedule = insertedSchedules.find(s => s.sportId === basketball.id)!;

        console.log("⚔️ Creating Matches...");
        await db.insert(schema.matches).values([
            {
                scheduleId: futsalSchedule.id,
                sportId: futsal.id,
                classAId: class1.id,
                classBId: class99.id,
                name: "풋살 A조",
                location: "북측 풋살장 A",
                status: "ONGOING" // Maps to "진행" on frontend
            },
            {
                scheduleId: basketballSchedule.id,
                sportId: basketball.id,
                classAId: class1.id,
                classBId: class99.id,
                name: "농구 C조",
                location: "서측 체육관 농구 코트",
                status: "SCHEDULED" // Maps to "예정" on frontend
            }
        ]);

        console.log("✅ Seed completed successfully!");
    } catch (error) {
        console.error("❌ Seed failed:");
        console.error(error);
        process.exit(1);
    } finally {
        // Close DB Connection
        await client.end();
    }
}

main();
