import { db } from '$lib/server/db';
import { matches, schedules, sports, classes, registers, rosters, users } from '$lib/server/db/schema';
import { eq, and, or, sql, asc } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

const classA = alias(classes, 'classA');
const classB = alias(classes, 'classB');

export const load: PageServerLoad = async ({ url, locals }) => {
    // Role guard: only managers and admins can access the record page
    const user = locals.user;
    if (!user) throw redirect(302, '/login');
    if (!user.isManager && !user.isAdmin) throw redirect(302, '/dashboard');

    // Fetch all matches for the sidebar
    const allMatches = await db
        .select({
            id: matches.id,
            status: matches.status,
            name: matches.name,
            location: matches.location,
            matchNotes: matches.matchNotes,
            sportName: sports.name,
            startTime: schedules.startTime,
            classA: classA.classNumber,
            classB: classB.classNumber,
        })
        .from(matches)
        .innerJoin(schedules, eq(matches.scheduleId, schedules.id))
        .innerJoin(sports, eq(matches.sportId, sports.id))
        .leftJoin(classA, eq(matches.classAId, classA.id))
        .leftJoin(classB, eq(matches.classBId, classB.id))
        .orderBy(
            asc(sql`CASE 
                WHEN ${matches.status} = 'ONGOING' THEN 1 
                WHEN ${matches.status} = 'SCHEDULED' THEN 2 
                WHEN ${matches.status} = 'PENDING_SCHEDULE' THEN 3 
                WHEN ${matches.status} = 'FINISHED' THEN 4 
                ELSE 5 
            END`),
            asc(schedules.startTime)
        );

    const activeMatchId = url.searchParams.get('matchId');

    let activeMatchDetails = null;

    if (activeMatchId) {
        // Fetch specific match details
        const activeMatch = await db
            .select({
                id: matches.id,
                scheduleId: matches.scheduleId,
                sportId: matches.sportId,
                classAId: matches.classAId,
                classBId: matches.classBId,
                status: matches.status,
                scoreA: matches.scoreA,
                scoreB: matches.scoreB,
                classA: classA.classNumber,
                classB: classB.classNumber,
                minPlayers: sports.minPlayers,
            })
            .from(matches)
            .innerJoin(sports, eq(matches.sportId, sports.id))
            .leftJoin(classA, eq(matches.classAId, classA.id))
            .leftJoin(classB, eq(matches.classBId, classB.id))
            .where(eq(matches.id, activeMatchId))
            .limit(1)
            .then(res => res[0]);

        if (activeMatch) {
            // Fetch EXPECTED rosters for Team A and Team B
            const teamARoster = await db
                .select({ userId: rosters.userId })
                .from(rosters)
                .where(and(eq(rosters.classId, activeMatch.classAId!), eq(rosters.sportId, activeMatch.sportId!)));

            const teamBRoster = await db
                .select({ userId: rosters.userId })
                .from(rosters)
                .where(and(eq(rosters.classId, activeMatch.classBId!), eq(rosters.sportId, activeMatch.sportId!)));

            const teamAUserIds = new Set(teamARoster.map(r => r.userId));
            const teamBUserIds = new Set(teamBRoster.map(r => r.userId));

            // Fetch ACTUAL registers for this schedule
            const matchRegisters = await db
                .select({
                    registerId: registers.id,
                    userId: users.id,
                    name: users.name,
                    studentNumber: users.studentNumber,
                    classId: users.classId
                })
                .from(registers)
                .innerJoin(users, eq(registers.userId, users.id))
                .where(eq(registers.scheduleId, activeMatch.scheduleId!));

            // Categorize registers into Team A, Team B, Cheering
            const teamACheckedIn = [];
            const teamBCheckedIn = [];
            const cheeringCheckedIn = [];

            for (const reg of matchRegisters) {
                if (teamAUserIds.has(reg.userId)) {
                    teamACheckedIn.push(reg);
                } else if (teamBUserIds.has(reg.userId)) {
                    teamBCheckedIn.push(reg);
                } else if (reg.classId === activeMatch.classAId || reg.classId === activeMatch.classBId) {
                    // Belong to the class but not in roster -> Cheering
                    cheeringCheckedIn.push(reg);
                } else {
                    // Other class members cheering?
                    cheeringCheckedIn.push(reg);
                }
            }

            activeMatchDetails = {
                ...activeMatch,
                attendance: {
                    teamATotal: activeMatch.minPlayers,
                    teamBTotal: activeMatch.minPlayers,
                    teamA: teamACheckedIn,
                    teamB: teamBCheckedIn,
                    cheering: cheeringCheckedIn
                }
            };
        }
    }

    return {
        allMatches,
        activeMatchDetails
    };
};

export const actions: Actions = {
    registerPlayer: async ({ request }) => {
        const data = await request.formData();
        const matchId = data.get('matchId')?.toString();
        const scanType = data.get('scanType')?.toString();
        const studentNumber = data.get('studentNumber')?.toString();

        if (!matchId || !studentNumber) {
            return fail(400, { message: 'Missing matchId or studentNumber' });
        }

        const match = await db.query.matches.findFirst({
            where: (matches, { eq }) => eq(matches.id, matchId)
        });

        if (!match || !match.scheduleId) {
            return fail(404, { message: 'Match not found' });
        }

        const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.studentNumber, studentNumber)
        });

        if (!user) {
            return fail(404, { message: 'User not found' });
        }

        if (scanType !== "Cheering") {
            // Player Registration Logic
            const targetClassId = scanType === "Team A" ? match.classAId : match.classBId;

            // 1. Must belong to the specific team they are scanning for
            if (user.classId !== targetClassId) {
                return fail(400, { message: '해당 팀 소속이 아닙니다.' });
            }

            // 2. Must be on the sports roster
            const rosterEntry = await db.query.rosters.findFirst({
                where: (rosters, { eq, and }) =>
                    and(
                        eq(rosters.userId, user.id),
                        eq(rosters.sportId, match.sportId),
                        eq(rosters.classId, user.classId!)
                    )
            });

            if (!rosterEntry) {
                return fail(400, { message: '해당 종목 출전 엔트리(선수 명단)에 등록되어 있지 않습니다.' });
            }
        } else {
            // Cheering Registration Logic
            // Cheering can be anyone, so no class/roster check is needed!
        }

        // Check if already registered
        const existing = await db.query.registers.findFirst({
            where: (registers, { eq, and }) =>
                and(
                    eq(registers.scheduleId, match.scheduleId!),
                    eq(registers.userId, user.id)
                )
        });

        if (existing) {
            return fail(400, { message: '이미 체크인 된 선수입니다.' });
        }

        await db.insert(registers).values({
            scheduleId: match.scheduleId,
            userId: user.id,
            classId: user.classId!
        });

        return { success: true };
    },

    startMatch: async ({ request }) => {
        const data = await request.formData();
        const matchId = data.get('matchId')?.toString();

        if (!matchId) return fail(400, { message: 'Missing matchId' });

        await db.update(matches)
            .set({ status: 'ONGOING' })
            .where(eq(matches.id, matchId));

        return { success: true };
    },

    finalizeMatch: async ({ request }) => {
        const data = await request.formData();
        const matchId = data.get('matchId')?.toString();
        const scoreA = parseInt(data.get('scoreA')?.toString() || '0');
        const scoreB = parseInt(data.get('scoreB')?.toString() || '0');
        const matchNotes = data.get('matchNotes')?.toString() || null;

        if (!matchId) return fail(400, { message: 'Missing matchId' });

        const match = await db.query.matches.findFirst({
            where: (matches, { eq }) => eq(matches.id, matchId)
        });

        if (match) {
            await db.update(matches)
                .set({ status: 'FINISHED', scoreA, scoreB, matchNotes })
                .where(eq(matches.id, matchId));
        }

        return { success: true };
    },

    forfeitMatch: async ({ request }) => {
        const data = await request.formData();
        const matchId = data.get('matchId')?.toString();

        if (!matchId) return fail(400, { message: 'Missing matchId' });

        await db.update(matches)
            .set({
                status: 'FINISHED',
                matchNotes: JSON.stringify({ note: '기권패 / 몰수패 처리' })
            })
            .where(eq(matches.id, matchId));

        return { success: true };
    }
};
