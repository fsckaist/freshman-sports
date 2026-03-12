import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { eq, inArray } from "drizzle-orm"; // Need to import these if using them

const connectionString =
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/postgres";

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
    console.log("🌱 Starting Tournament Bracket Seed...");

    try {
        console.log("🧹 Cleaning up old bracket data...");
        await db.delete(schema.tournament_brackets);

        // Fetch all sports
        const allSports = await db.select().from(schema.sports);
        if (allSports.length === 0) {
            console.error("❌ No sports found. Please run seed.ts first.");
            process.exit(1);
        }

        // Fetch or create 12 classes
        let allClasses = await db.select().from(schema.classes);
        const requiredClassNumbers = Array.from({ length: 12 }, (_, i) => i + 1);
        const existingClassNumbers = new Set(allClasses.map((c) => c.classNumber));

        const classesToInsert = requiredClassNumbers
            .filter((num) => !existingClassNumbers.has(num))
            .map((num) => ({ classNumber: num }));

        if (classesToInsert.length > 0) {
            console.log(`🏫 Inserting ${classesToInsert.length} missing classes...`);
            await db.insert(schema.classes).values(classesToInsert);
            allClasses = await db.select().from(schema.classes);
        }

        const classPool = allClasses.slice(0, 12); // Use first 12 classes
        if (classPool.length < 12) {
            throw new Error("Not enough classes");
        }

        console.log("🏆 Seeding Brackets for each sport...");

        for (const sport of allSports) {
            console.log(`- Generating bracket for ${sport.name}`);

            // We want a 16-slot Round 1
            // 12 classes means 4 byes.
            const slotsCount = 16;
            let currentClassIndex = 0;

            // Create the first round configuration
            // A common way to place 4 byes is at specific positions.
            const round1Nodes: typeof schema.tournament_brackets.$inferInsert[] = [];

            // To make it look balanced, maybe put byes at pos 1, 6, 9, 14
            const byePositions = new Set([1, 6, 9, 14]);

            for (let i = 0; i < slotsCount; i++) {
                if (byePositions.has(i)) {
                    round1Nodes.push({
                        sportId: sport.id,
                        round: 1,
                        position: i,
                        isEliminatedSlot: true,
                        status: "default",
                        classId: null
                    });
                } else {
                    const classId = classPool[currentClassIndex++].id;
                    round1Nodes.push({
                        sportId: sport.id,
                        round: 1,
                        position: i,
                        isEliminatedSlot: false,
                        status: "default", // will randomize later
                        classId: classId
                    });
                }
            }

            // Let's simulate tournament progression. 
            // We keep track of the trees to determine winners.
            const fullBracket = [round1Nodes];

            // Assign random results for Round 1 to Round 3, partial Round 4
            for (let r = 1; r <= 5; r++) {
                if (r === 1) {
                    // For round 1, we determine winners by looking at pairs
                    const currentRound = fullBracket[0];
                    const nextRound: typeof schema.tournament_brackets.$inferInsert[] = [];
                    for (let p = 0; p < currentRound.length; p += 2) {
                        const node1 = currentRound[p];
                        const node2 = currentRound[p + 1];

                        // Decide winner
                        let winnerClassId = null;
                        if (node1.isEliminatedSlot) {
                            winnerClassId = node2.classId;
                            node1.status = "default";
                            node2.status = "default"; // Not really played
                        } else if (node2.isEliminatedSlot) {
                            winnerClassId = node1.classId;
                            node1.status = "default";
                            node2.status = "default"; // Not really played
                        } else {
                            // Actual match, randomize if this sport has progressed this far
                            const oneWins = Math.random() > 0.5;
                            winnerClassId = oneWins ? node1.classId : node2.classId;
                            node1.status = oneWins ? "win" : "lose";
                            node2.status = oneWins ? "lose" : "win";
                        }

                        nextRound.push({
                            sportId: sport.id,
                            round: 2,
                            position: p / 2,
                            isEliminatedSlot: false,
                            status: "default",
                            classId: winnerClassId
                        });
                    }
                    fullBracket.push(nextRound);
                } else if (r === 2 || r === 3) {
                    const currentRound = fullBracket[r - 1];
                    const nextRound: typeof schema.tournament_brackets.$inferInsert[] = [];
                    for (let p = 0; p < currentRound.length; p += 2) {
                        const node1 = currentRound[p];
                        const node2 = currentRound[p + 1];

                        let winnerClassId = null;
                        // For r=2 (Round 2) we simulate all completed
                        // For r=3 (Round 3) randomly simulate
                        const isCompleted = r === 2 || Math.random() > 0.3;

                        if (isCompleted && node1.classId && node2.classId) {
                            const oneWins = Math.random() > 0.5;
                            winnerClassId = oneWins ? node1.classId : node2.classId;
                            node1.status = oneWins ? "win" : "lose";
                            node2.status = oneWins ? "lose" : "win";
                        } else {
                            node1.status = "default";
                            node2.status = "default";
                        }

                        nextRound.push({
                            sportId: sport.id,
                            round: r + 1,
                            position: p / 2,
                            isEliminatedSlot: false,
                            status: "default",
                            classId: winnerClassId
                        });
                    }
                    if (r < 5) fullBracket.push(nextRound);
                } else if (r === 4) {
                    const currentRound = fullBracket[r - 1];
                    const nextRound: typeof schema.tournament_brackets.$inferInsert[] = [];
                    // Final winner
                    const node1 = currentRound[0];
                    const node2 = currentRound[1];
                    let winnerClassId = null;
                    if (node1.classId && node2.classId && Math.random() > 0.5) {
                        const oneWins = Math.random() > 0.5;
                        winnerClassId = oneWins ? node1.classId : node2.classId;
                        node1.status = oneWins ? "win" : "lose";
                        node2.status = oneWins ? "lose" : "win";
                    }
                    nextRound.push({
                        sportId: sport.id,
                        round: 5,
                        position: 0,
                        isEliminatedSlot: false,
                        status: "default",
                        classId: winnerClassId
                    });
                    fullBracket.push(nextRound);
                }
            }

            const allNodes = fullBracket.flat();
            await db.insert(schema.tournament_brackets).values(allNodes);
        }

        console.log("✅ Bracket Seed completed successfully!");
    } catch (error) {
        console.error("❌ Seed failed:", error);
    } finally {
        await client.end();
        process.exit(0);
    }
}

main();
