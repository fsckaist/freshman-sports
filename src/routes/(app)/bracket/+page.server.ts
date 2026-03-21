import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { tournament_brackets, sports, classes, system_config } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
    const user = locals.user;
    if (!user) throw redirect(302, '/login');

    // State guard: bracket only visible during ONGOING
    const { eventState } = await parent();
    if (eventState !== 'ONGOING') throw redirect(302, '/');

    // 1. Fetch all brackets joined with classes and sports
    const allNodes = await db
        .select({
            bracket: tournament_brackets,
            sportSlug: sports.slug,
            classNumber: classes.classNumber
        })
        .from(tournament_brackets)
        .innerJoin(sports, eq(tournament_brackets.sportId, sports.id))
        .leftJoin(classes, eq(tournament_brackets.classId, classes.id))
        .orderBy(asc(tournament_brackets.round), asc(tournament_brackets.position));

    // 2. Format into the nested structure 
    const bracketDataBySport: Record<string, any[]> = {};

    // Group nodes by sport slug and round
    const nodesBySportAndRound: Record<string, Record<number, any[]>> = {};

    for (const row of allNodes) {
        const slug = row.sportSlug;
        const roundNum = row.bracket.round;

        if (!nodesBySportAndRound[slug]) {
            nodesBySportAndRound[slug] = {};
        }
        if (!nodesBySportAndRound[slug][roundNum]) {
            nodesBySportAndRound[slug][roundNum] = [];
        }

        const teamNodeData = {
            className: row.bracket.classId ? `${row.classNumber}` : "0",
            state: row.bracket.status,
            notAvailable: row.bracket.isEliminatedSlot,
            ourTeam: locals?.user?.classId ? row.bracket.classId === locals.user.classId : false
        };

        nodesBySportAndRound[slug][roundNum].push({
            position: row.bracket.position,
            data: teamNodeData
        });
    }

    // Convert into Round[] -> Match[]
    for (const [slug, roundsMap] of Object.entries(nodesBySportAndRound)) {
        const roundNumbers = Object.keys(roundsMap).map(Number).sort((a, b) => a - b);
        const sportRounds = [];

        for (let i = 0; i < roundNumbers.length; i++) {
            const rNum = roundNumbers[i];
            const nodes = roundsMap[rNum].sort((a, b) => a.position - b.position);
            const isLastRound = i === roundNumbers.length - 1;

            const matchCount = Math.ceil(nodes.length / 2);
            let title = `라운드 ${rNum}`;

            if (isLastRound) title = "최종 결과";
            else if (rNum === 5) title = "결승 및 3,4위전";
            else if (matchCount === 1) title = "결승";
            else if (matchCount === 2) title = "준결승";
            else if (matchCount === 4) title = "8강";
            else if (matchCount === 8) title = "16강";
            else if (matchCount === 16) title = "32강";

            const matches = [];
            if (isLastRound) {
                // Podium results (Round 6 with 3 slots)
                for (let j = 0; j < nodes.length; j++) {
                    matches.push({
                        team1: nodes[j].data,
                        team2: { className: "0", state: "default", notAvailable: true }
                    });
                }
            } else if (rNum === 5) {
                // Bracket Final and Bronze Match
                matches.push({
                    team1: nodes[0]?.data || { className: "0", state: "default" },
                    team2: nodes[1]?.data || { className: "0", state: "default" }
                });
                if (nodes.length > 2) {
                    matches.push({
                        team1: nodes[2]?.data || { className: "0", state: "default" },
                        team2: nodes[3]?.data || { className: "0", state: "default" }
                    });
                }
            } else {
                for (let j = 0; j < nodes.length; j += 2) {
                    matches.push({
                        team1: nodes[j]?.data || { className: "0", state: "default" },
                        team2: nodes[j + 1]?.data || { className: "0", state: "default" }
                    });
                }
            }

            sportRounds.push({
                title,
                matches
            });
        }
        bracketDataBySport[slug] = sportRounds;
    }

    return {
        bracketDataBySport
    };
};
