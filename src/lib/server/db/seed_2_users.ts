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
    console.log("Starting Database Seed - 2. Users and Classes...");

    try {
        // --- 1. Classes (31) ---
        console.log("Inserting 31 Classes...");
        // Ensure no previous classes exist to avoid duplication if run multiple times?
        // Let's rely on seed_1_setup.ts for cleanup, or do a quick delete here.
        // The user split request didn't specifically say we should isolate cleanups, but usually we just don't delete if we expect it to run after setup.
        // We will just delete classes & users to make this script idempotent.

        // Let's delete users and rosters to be safe
        console.log("Cleaning up old users and classes data...");
        await db.delete(schema.rosters);
        await db.delete(schema.users);
        await db.delete(schema.classes);

        const insertedClasses = await db.insert(schema.classes)
            .values(Array.from({ length: 31 }, (_, i) => ({ classNumber: i + 1 })))
            .returning();

        // --- 2. Users from CSV ---
        const isDemo = process.env.IS_DEMO === 'true';
        const csvFileName = isDemo ? 'user_demo.csv' : 'user.csv';
        console.log(`Inserting Users from ../data/${csvFileName}...`);
        const csvPath = path.resolve(process.cwd(), `../data/${csvFileName}`);
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const lines = csvContent.split('\n').filter(line => line.trim() !== '');

        // Remove header
        const header = lines.shift();

        const usersMap = new Map<string, typeof schema.users.$inferInsert>();

        for (const line of lines) {
            const [class_number, student_number, name, phone_number, is_proctor, is_referee, is_manager, is_admin] = line.split(',').map(s => s.trim());

            const classNum = parseInt(class_number);
            const targetClass = insertedClasses.find(c => c.classNumber === classNum);

            const userData: typeof schema.users.$inferInsert = {
                name,
                studentNumber: student_number,
                phoneNumber: phone_number,
                classId: targetClass?.id || null,
                isProctor: is_proctor.toUpperCase() === 'TRUE',
                isReferee: is_referee.toUpperCase() === 'TRUE',
                isManager: is_manager.toUpperCase() === 'TRUE',
                isAdmin: is_admin.toUpperCase() === 'TRUE',
                agreedPrivacy: false,
                agreedRules: false,
                gender: null
            };

            if (usersMap.has(student_number)) {
                const existing = usersMap.get(student_number)!;
                // Merge roles
                existing.isProctor = existing.isProctor || userData.isProctor;
                existing.isReferee = existing.isReferee || userData.isReferee;
                existing.isManager = existing.isManager || userData.isManager;
                existing.isAdmin = existing.isAdmin || userData.isAdmin;
                // If existing has no class but user does, update it
                if (!existing.classId && userData.classId) {
                    existing.classId = userData.classId;
                }
            } else {
                usersMap.set(student_number, userData);
            }
        }

        const usersToInsert = Array.from(usersMap.values());

        const batchSize = 100;
        let insertedUsers: typeof schema.users.$inferSelect[] = [];
        for (let i = 0; i < usersToInsert.length; i += batchSize) {
            const rows = await db.insert(schema.users).values(usersToInsert.slice(i, i + batchSize)).returning();
            insertedUsers = insertedUsers.concat(rows);
        }

        console.log("Users and Classes Setup complete!");
    } catch (error) {
        console.error("Users and Classes Setup failed:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
