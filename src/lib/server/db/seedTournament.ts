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

        // Fetch or create 31 classes
        let allClasses = await db.select().from(schema.classes);
        const requiredClassNumbers = Array.from({ length: 31 }, (_, i) => i + 1);
        const existingClassNumbers = new Set(allClasses.map((c) => c.classNumber));

        const classesToInsert = requiredClassNumbers
            .filter((num) => !existingClassNumbers.has(num))
            .map((num) => ({ classNumber: num }));

        if (classesToInsert.length > 0) {
            console.log(`🏫 Inserting ${classesToInsert.length} missing classes...`);
            await db.insert(schema.classes).values(classesToInsert);
            allClasses = await db.select().from(schema.classes);
        }

        const classPool = allClasses.slice(0, 31); // Use first 31 classes
        if (classPool.length < 31) {
            throw new Error("Not enough classes");
        }

        console.log("🏆 Seeding Brackets for each sport...");

        for (const sport of allSports) {
            console.log(`- Generating bracket for ${sport.name}`);

            // We want a 32-slot Round 1
            // 31 classes means 1 bye at the end.
            const slotsCount = 32;
            let currentClassIndex = 0;

            // Create the first round configuration
            const round1Nodes: typeof schema.tournament_brackets.$inferInsert[] = [];

            // Bye at the very last position
            const byePositions = new Set([31]);

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
                    if (r < 4) fullBracket.push(nextRound);
                } else if (r === 4) {
                    const currentRound = fullBracket[r - 1]; // Semifinals
                    const nextRound: typeof schema.tournament_brackets.$inferInsert[] = [];
                    
                    // Match 1: Pos 0 vs Pos 1 -> Winner to GF (Pos 0), Loser to BM (Pos 2)
                    const sf1_1 = currentRound[0];
                    const sf1_2 = currentRound[1];
                    let gf1_winner = null;
                    let bm1_loser = null;
                    
                    if (sf1_1?.classId && sf1_2?.classId && Math.random() > 0.5) {
                        const oneWins = Math.random() > 0.5;
                        gf1_winner = oneWins ? sf1_1.classId : sf1_2.classId;
                        bm1_loser = oneWins ? sf1_2.classId : sf1_1.classId;
                        sf1_1.status = oneWins ? "win" : "lose";
                        sf1_2.status = oneWins ? "lose" : "win";
                    }

                    // Match 2: Pos 2 vs Pos 3 -> Winner to GF (Pos 1), Loser to BM (Pos 3)
                    const sf2_1 = currentRound[2];
                    const sf2_2 = currentRound[3];
                    let gf2_winner = null;
                    let bm2_loser = null;
                    
                    if (sf2_1?.classId && sf2_2?.classId && Math.random() > 0.5) {
                        const oneWins = Math.random() > 0.5;
                        gf2_winner = oneWins ? sf2_1.classId : sf2_2.classId;
                        bm2_loser = oneWins ? sf2_2.classId : sf2_1.classId;
                        sf2_1.status = oneWins ? "win" : "lose";
                        sf2_2.status = oneWins ? "lose" : "win";
                    }

                    // Grand Finals Slots (Pos 0, 1)
                    nextRound.push({ sportId: sport.id, round: 5, position: 0, isEliminatedSlot: false, status: "default", classId: gf1_winner });
                    nextRound.push({ sportId: sport.id, round: 5, position: 1, isEliminatedSlot: false, status: "default", classId: gf2_winner });
                    // Bronze Match Slots (Pos 2, 3)
                    nextRound.push({ sportId: sport.id, round: 5, position: 2, isEliminatedSlot: false, status: "default", classId: bm1_loser });
                    nextRound.push({ sportId: sport.id, round: 5, position: 3, isEliminatedSlot: false, status: "default", classId: bm2_loser });
                    
                    fullBracket.push(nextRound);
                } else if (r === 5) {
                    const currentRound = fullBracket[r - 1]; // Finals & Bronze Match
                    const nextRound: typeof schema.tournament_brackets.$inferInsert[] = [];
                    
                    // Grand Final
                    const gf1 = currentRound[0];
                    const gf2 = currentRound[1];
                    let champion = null;
                    let runnerUp = null;
                    if (gf1?.classId && gf2?.classId && Math.random() > 0.5) {
                        const oneWins = Math.random() > 0.5;
                        champion = oneWins ? gf1.classId : gf2.classId;
                        runnerUp = oneWins ? gf2.classId : gf1.classId;
                        gf1.status = oneWins ? "win" : "lose";
                        gf2.status = oneWins ? "lose" : "win";
                    }

                    // Bronze Match
                    const bm1 = currentRound[2];
                    const bm2 = currentRound[3];
                    let thirdPlace = null;
                    if (bm1?.classId && bm2?.classId && Math.random() > 0.5) {
                        const oneWins = Math.random() > 0.5;
                        thirdPlace = oneWins ? bm1.classId : bm2.classId;
                        bm1.status = oneWins ? "win" : "lose";
                        bm2.status = oneWins ? "lose" : "win";
                    }

                    // 1st Place (Pos 0)
                    nextRound.push({ sportId: sport.id, round: 6, position: 0, isEliminatedSlot: false, status: "default", classId: champion });
                    // 2nd Place (Pos 1)
                    nextRound.push({ sportId: sport.id, round: 6, position: 1, isEliminatedSlot: false, status: "default", classId: runnerUp });
                    // 3rd Place (Pos 2)
                    nextRound.push({ sportId: sport.id, round: 6, position: 2, isEliminatedSlot: false, status: "default", classId: thirdPlace });
                    
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
