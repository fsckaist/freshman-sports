import { db } from '$lib/server/db';
import { matches, schedules, sports, classes, registers, rosters, users } from '$lib/server/db/schema';
import { eq, and, or, sql, asc, isNotNull, inArray } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

const classA = alias(classes, 'classA');
const classB = alias(classes, 'classB');
const referee = alias(users, 'referee');
const manager = alias(users, 'manager');

export const load: PageServerLoad = async ({ url, locals }) => {
    // Role guard: only managers and admins can access the record page
    const user = locals.user;
    if (!user) throw redirect(302, '/login');
    if (!user.isManager && !user.isAdmin) throw redirect(302, '/');

    // Fetch all sports for tabs
    const allSportsList = await db
        .select({
            id: sports.id,
            name: sports.name,
        })
        .from(sports)
        .orderBy(asc(sports.displayOrder));

    // Fetch all matches for the sidebar
    const allMatches = await db
        .select({
            id: matches.id,
            status: matches.status,
            name: matches.name,
            location: matches.location,
            matchNotes: matches.matchNotes,
            sportId: matches.sportId,
            sportName: sports.name,
            startTime: schedules.startTime,
            classA: classA.classNumber,
            classB: classB.classNumber,
            classAId: matches.classAId,
            classBId: matches.classBId,
            refereeName: referee.name,
            managerName: manager.name,
        })
        .from(matches)
        .innerJoin(schedules, eq(matches.scheduleId, schedules.id))
        .innerJoin(sports, eq(matches.sportId, sports.id))
        .leftJoin(classA, eq(matches.classAId, classA.id))
        .leftJoin(classB, eq(matches.classBId, classB.id))
        .leftJoin(referee, eq(matches.refereeId, referee.id))
        .leftJoin(manager, eq(matches.managerId, manager.id))
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

    // Fetch attendance for ALL matches to show in sidebar
    const allMatchIds = allMatches.map(m => m.id);
    const allRegisters = allMatchIds.length > 0 ? await db
        .select({
            matchId: matches.id,
            userId: users.id,
            userName: users.name,
            classId: users.classId,
            checkedInAt: registers.checkedInAt,
            isCheering: registers.isCheering
        })
        .from(registers)
        .innerJoin(users, eq(registers.userId, users.id))
        .innerJoin(schedules, eq(registers.scheduleId, schedules.id))
        .innerJoin(matches, eq(matches.scheduleId, schedules.id))
        .where(
            and(
                inArray(matches.id, allMatchIds),
                isNotNull(matches.scheduleId)
            )
        ) : [];

    // Map registers back to matches
    const matchesWithAttendance = allMatches.map(m => {
        const matchRegs = allRegisters.filter(r => r.matchId === m.id);
        const teamARegs = matchRegs.filter(r => r.classId === m.classAId);
        const teamBRegs = matchRegs.filter(r => r.classId === m.classBId);

        return {
            ...m,
            attendance: {
                teamA: teamARegs.filter(r => r.checkedInAt).map(r => ({ name: r.userName })),
                plannedTeamA: teamARegs.filter(r => !r.checkedInAt).map(r => ({ name: r.userName })),
                teamB: teamBRegs.filter(r => r.checkedInAt).map(r => ({ name: r.userName })),
                plannedTeamB: teamBRegs.filter(r => !r.checkedInAt).map(r => ({ name: r.userName }))
            }
        };
    });

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
                refereeName: referee.name,
                managerName: manager.name,
                matchNotes: matches.matchNotes,
                recordStructure: sports.recordStructure
            })
            .from(matches)
            .innerJoin(sports, eq(matches.sportId, sports.id))
            .leftJoin(classA, eq(matches.classAId, classA.id))
            .leftJoin(classB, eq(matches.classBId, classB.id))
            .leftJoin(referee, eq(matches.refereeId, referee.id))
            .leftJoin(manager, eq(matches.managerId, manager.id))
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
                    classId: users.classId,
                    checkedInAt: registers.checkedInAt,
                    isCheering: registers.isCheering
                })
                .from(registers)
                .innerJoin(users, eq(registers.userId, users.id))
                .where(eq(registers.scheduleId, activeMatch.scheduleId!));

            // Separate cheering into Class A and Class B
            const teamACheckedIn = [];
            const teamAOfflinePlanned = []; // Those who voted but haven't checked in
            const teamBCheckedIn = [];
            const teamBOfflinePlanned = [];
            const cheeringA = [];
            const cheeringB = [];
            const otherCheering = []; 

            for (const reg of matchRegisters) {
                if (reg.checkedInAt) {
                    if (reg.isCheering) {
                        // Explicitly cheering context
                        if (reg.classId === activeMatch.classAId) {
                            cheeringA.push(reg);
                        } else if (reg.classId === activeMatch.classBId) {
                            cheeringB.push(reg);
                        } else {
                            otherCheering.push(reg);
                        }
                    } else if (teamAUserIds.has(reg.userId)) {
                        teamACheckedIn.push(reg);
                    } else if (teamBUserIds.has(reg.userId)) {
                        teamBCheckedIn.push(reg);
                    } else {
                        // Cheer section - fallback for those not on roster
                        if (reg.classId === activeMatch.classAId) {
                            cheeringA.push(reg);
                        } else if (reg.classId === activeMatch.classBId) {
                            cheeringB.push(reg);
                        } else {
                            otherCheering.push(reg);
                        }
                    }
                } else {
                    // Not checked in yet (voted only)
                    if (teamAUserIds.has(reg.userId)) {
                        teamAOfflinePlanned.push(reg);
                    } else if (teamBUserIds.has(reg.userId)) {
                        teamBOfflinePlanned.push(reg);
                    }
                }
            }

            activeMatchDetails = {
                ...activeMatch,
                attendance: {
                    teamATotal: activeMatch.minPlayers,
                    teamBTotal: activeMatch.minPlayers,
                    teamA: teamACheckedIn,
                    teamB: teamBCheckedIn,
                    cheeringA,
                    cheeringB,
                    plannedTeamA: teamAOfflinePlanned,
                    plannedTeamB: teamBOfflinePlanned
                }
            };
        }
    }

    return {
        allMatches: matchesWithAttendance,
        allSports: allSportsList,
        activeMatchDetails
    };
};

export const actions: Actions = {
    registerPlayer: async ({ request, locals }) => {
        const userAction = locals.user;
        if (!userAction || (!userAction.isManager && !userAction.isAdmin)) {
            return fail(403, { message: '권한이 없습니다.' });
        }

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
        }

        // Check if already registered
        const existing = await db.query.registers.findFirst({
            where: (registers, { eq, and }) =>
                and(
                    eq(registers.scheduleId, match.scheduleId!),
                    eq(registers.userId, user.id)
                )
        });

        if (existing && existing.checkedInAt) {
            const alreadyCheering = existing.isCheering;
            const scanningAsCheering = scanType === "Cheering";

            if (alreadyCheering && scanningAsCheering) {
                return fail(400, { message: '이미 응원 인원으로 등록된 사용자입니다.' });
            }

            if (!alreadyCheering) {
                if (scanningAsCheering) {
                    return fail(400, { message: '이미 선수로 등록된 사용자는 응원 인원으로 변경할 수 없습니다.' });
                } else {
                    return fail(400, { message: '이미 선수로 등록된 사용자입니다.' });
                }
            }

            // Case: alreadyCheering is true, and scanningAsCheering is false.
            // Allow "upgrading" to player status.
        }

        if (existing) {
            await db.update(registers)
                .set({ 
                    checkedInAt: new Date(),
                    isCheering: scanType === "Cheering"
                })
                .where(eq(registers.id, existing.id));
        } else {
            await db.insert(registers).values({
                scheduleId: match.scheduleId,
                userId: user.id,
                classId: user.classId!,
                checkedInAt: new Date(),
                isCheering: scanType === "Cheering"
            });
        }

        return { 
            success: true, 
            message: scanType === "Cheering" ? "응원 인원으로 등록되었습니다." : "선수로 등록되었습니다." 
        };
    },

    startMatch: async ({ request, locals }) => {
        const userAction = locals.user;
        if (!userAction || (!userAction.isManager && !userAction.isAdmin)) {
            return fail(403, { message: '권한이 없습니다.' });
        }

        const data = await request.formData();
        const matchId = data.get('matchId')?.toString();

        if (!matchId) return fail(400, { message: 'Missing matchId' });

        await db.update(matches)
            .set({ status: 'ONGOING' })
            .where(eq(matches.id, matchId));

        return { success: true };
    },

    finalizeMatch: async ({ request, locals }) => {
        const userAction = locals.user;
        if (!userAction || (!userAction.isManager && !userAction.isAdmin)) {
            return fail(403, { message: '권한이 없습니다.' });
        }

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

    forfeitMatch: async ({ request, locals }) => {
        const userAction = locals.user;
        if (!userAction || (!userAction.isManager && !userAction.isAdmin)) {
            return fail(403, { message: '권한이 없습니다.' });
        }

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
