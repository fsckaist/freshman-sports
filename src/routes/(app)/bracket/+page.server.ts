import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { tournament_brackets, sports, classes, system_config } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const user = locals.user;
    if (!user) throw redirect(302, '/login');

    // State guard: bracket only visible during ONGOING
    const configs = await db.select().from(system_config).limit(1);
    const eventState = configs[0]?.eventState ?? 'REGISTRATION';
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
            let title = `Round ${rNum}`;

            if (isLastRound && nodes.length === 1) title = "Winner";
            else if (matchCount === 1) title = "Finals";
            else if (matchCount === 2) title = "Semifinals";
            else if (matchCount === 4) title = "Quarterfinals";
            else if (matchCount === 8) title = "Round of 16";
            else if (matchCount === 16) title = "Round of 32";

            const matches = [];
            if (isLastRound && nodes.length === 1) {
                matches.push({
                    team1: nodes[0].data,
                    team2: { className: "0", state: "default", notAvailable: true } // Visual padding
                });
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
