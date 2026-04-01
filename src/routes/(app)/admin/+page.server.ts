import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sports, schedules, registers, users, rosters, matches, classes, tournament_brackets, system_config, sport_locations, type EventState } from '$lib/server/db/schema';
import { eq, and, asc, isNotNull, or, inArray } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { PageServerLoad, Actions } from './$types';
import { computeOrUpdateNextMatchWindow, propagateByeWindow, addWeekdays, ensureScheduleSlots } from '$lib/server/scheduleWindowHelper';
import { signToken, verifyToken } from '$lib/server/jwt';
import { dev } from '$app/environment';

/** 
 * Shared helper to ensure a Match object exists and is synchronized with the bracket nodes 
 * for a specific round and position. Handles automated GF/BM naming and bye propagation.
 */
async function syncBracketMatch(sportId: string, targetRound: number, targetPosition: number) {
    if (targetRound >= 6) return; // No matches for the result podium

    const pIdx = Math.floor(targetPosition / 2);
    const s1Pos = pIdx * 2;
    const s2Pos = pIdx * 2 + 1;

    // Get both slots in this match
    const matchSlots = await db.select().from(tournament_brackets).where(and(
        eq(tournament_brackets.sportId, sportId),
        eq(tournament_brackets.round, targetRound),
        or(eq(tournament_brackets.position, s1Pos), eq(tournament_brackets.position, s2Pos))
    ));

    if (matchSlots.length !== 2) return;

    const s1 = matchSlots.find(s => s.position === s1Pos)!;
    const s2 = matchSlots.find(s => s.position === s2Pos)!;

    const classA = s1.classId;
    const classB = s2.classId;
    const isAExcl = s1.isEliminatedSlot;
    const isBExcl = s2.isEliminatedSlot;

    let autoWinnerId: string | null = null;
    let bothEliminated = false;
    let hasInertOpponent = false;

    // Support BYE/Automatic logic
    if (classA && isBExcl) {
        autoWinnerId = classA;
        hasInertOpponent = true;
    } else if (classB && isAExcl) {
        autoWinnerId = classB;
        hasInertOpponent = true;
    } else if (isAExcl && isBExcl) {
        bothEliminated = true;
        hasInertOpponent = true;
    }

    let mId = s1.matchId || s2.matchId;
    const roundPrefixes: Record<number, string> = { 1: 'R32', 2: 'R16', 3: 'QF', 4: 'SF', 5: 'GF' };
    let prefix = roundPrefixes[targetRound] || `R${targetRound}`;
    if (targetRound === 5 && pIdx === 1) prefix = 'BM'; // Bronze Match

    if (hasInertOpponent) {
        const winnerId = bothEliminated ? null : autoWinnerId;
        if (!mId) {
            const [newMatch] = await db.insert(matches).values({
                sportId,
                status: 'FINISHED',
                isVerified: true,
                name: JSON.stringify({
                    ko: `${prefix}-M${pIdx + 1}`,
                    en: `${prefix}-M${pIdx + 1}`
                }),
                classAId: classA,
                classBId: classB,
                winnerClassId: winnerId,
                matchNotes: JSON.stringify({
                    ko: bothEliminated ? '양측 우승자 없음으로 인한 동시 탈락' : '상대측 우승자 없음으로 인한 부전승/자동승리',
                    en: bothEliminated ? 'Simultaneous elimination due to no winner on either side' : 'Bye win due to no opponent'
                })
            }).returning({ id: matches.id });
            mId = newMatch.id;

            await db.update(tournament_brackets).set({ matchId: mId }).where(and(
                eq(tournament_brackets.sportId, sportId),
                eq(tournament_brackets.round, targetRound),
                or(eq(tournament_brackets.position, s1Pos), eq(tournament_brackets.position, s2Pos))
            ));
        } else {
            await db.update(matches).set({
                status: 'FINISHED',
                isVerified: true,
                classAId: classA,
                classBId: classB,
                winnerClassId: winnerId,
            }).where(eq(matches.id, mId));
        }

        // Propagate further if needed
        const nextTargetRound = targetRound + 1;
        let nextTargetPosition = Math.floor(targetPosition / 2);
        if (targetRound === 5) {
            if (targetPosition < 2) nextTargetPosition = 0; // GF Winner -> 1st
            else nextTargetPosition = 2; // BM Winner -> 3rd
        }

        const [grandTargetNode] = await db.select().from(tournament_brackets).where(and(
            eq(tournament_brackets.sportId, sportId),
            eq(tournament_brackets.round, nextTargetRound),
            eq(tournament_brackets.position, nextTargetPosition)
        )).limit(1);

        if (grandTargetNode) {
            await db.update(tournament_brackets).set({
                classId: winnerId,
                isEliminatedSlot: bothEliminated,
                status: bothEliminated ? 'lose' : 'default'
            }).where(eq(tournament_brackets.id, grandTargetNode.id));
            await db.update(tournament_brackets).set({ status: (classA === winnerId && winnerId) ? 'win' : 'lose' }).where(eq(tournament_brackets.id, s1.id));
            await db.update(tournament_brackets).set({ status: (classB === winnerId && winnerId) ? 'win' : 'lose' }).where(eq(tournament_brackets.id, s2.id));

            await syncBracketMatch(sportId, nextTargetRound, nextTargetPosition);
        }
        if (mId) {
            try { await propagateByeWindow(mId); } catch (e) { console.error('propagateByeWindow error:', e); }
        }
    } else if (classA || classB) {
        if (!mId) {
            const [newMatch] = await db.insert(matches).values({
                sportId,
                status: 'PENDING_SCHEDULE',
                name: JSON.stringify({
                    ko: `${prefix}-M${pIdx + 1}`,
                    en: `${prefix}-M${pIdx + 1}`
                }),
                classAId: classA,
                classBId: classB,
            }).returning({ id: matches.id });
            mId = newMatch.id;
            await db.update(tournament_brackets).set({ matchId: mId }).where(and(
                eq(tournament_brackets.sportId, sportId),
                eq(tournament_brackets.round, targetRound),
                or(eq(tournament_brackets.position, s1Pos), eq(tournament_brackets.position, s2Pos))
            ));
        } else {
            await db.update(matches).set({ classAId: classA, classBId: classB }).where(eq(matches.id, mId));
        }
        if (mId) await computeOrUpdateNextMatchWindow(mId);
    }
}

export const load: PageServerLoad = async ({ url, locals }) => {
    try {
        const user = locals.user;
        if (!user) {
            throw redirect(302, '/login');
        }

        // Must be admin
        if (!user.isAdmin) {
            throw redirect(302, '/');
        }

        const activeTab = url.searchParams.get('tab') ?? 'schedule';

        // --- SHARED: Always needed (lightweight, parallelized) ---
        const [configRows, allSports, allLocations] = await Promise.all([
            db.select().from(system_config).limit(1),
            db.select().from(sports).orderBy(asc(sports.displayOrder)),
            db.select().from(sport_locations),
        ]);

        const eventState = (configRows[0]?.eventState ?? 'REGISTRATION') as EventState;
        const registrationDeadline = configRows[0]?.registrationDeadline ?? null;

        // Group locations by sportId
        const locationsMap = new Map<string, any[]>();
        for (const loc of allLocations) {
            if (!locationsMap.has(loc.sportId)) locationsMap.set(loc.sportId, []);
            locationsMap.get(loc.sportId)!.push(loc);
        }

        const sportsWithLocations = allSports.map(s => ({
            ...s,
            locations: locationsMap.get(s.id) || []
        }));

        if (allSports.length === 0) {
            return {
                sports: [], activeSportId: null, gridData: {},
                completedClasses: [], activeMatch: null, confirmGridData: {}, allUsers: [],
                finishedMatches: [], activeResultMatch: null, eventState: 'REGISTRATION',
                activeTab
            };
        }

        let requestedSportId = url.searchParams.get('sportId');
        let activeSport = sportsWithLocations.find(s => s.id === requestedSportId) || sportsWithLocations[0];

        // Base return value with shared data + empty defaults
        const baseReturn: Record<string, any> = {
            sports: sportsWithLocations,
            activeSportId: activeSport.id,
            activeTab,
            eventState,
            registrationDeadline,
            gridData: {},
            completedClasses: [],
            activeMatch: null,
            confirmGridData: {},
            allUsers: [],
            finishedMatches: [],
            activeResultMatch: null,
        };

        // --- TAB 1: Schedule Configuration Data (only when schedule tab is active) ---
        if (activeTab === 'schedule') {
            const [rawSchedules, scheduledMatchesForSport] = await Promise.all([
                db.select()
                    .from(schedules)
                    .where(eq(schedules.sportId, activeSport.id))
                    .orderBy(asc(schedules.startTime)),
                db.select({ scheduleId: matches.scheduleId })
                    .from(matches)
                    .where(and(
                        eq(matches.sportId, activeSport.id),
                        eq(matches.status, 'SCHEDULED')
                    )),
            ]);

            const scheduledCountMap = new Map<string, number>();
            for (const m of scheduledMatchesForSport) {
                if (m.scheduleId) {
                    scheduledCountMap.set(m.scheduleId, (scheduledCountMap.get(m.scheduleId) || 0) + 1);
                }
            }

            const dateKeys = Array.from(new Set(rawSchedules.map(rs => {
                const d = rs.startTime;
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            }))).sort();

            type ScheduleSlot = {
                id: string; startTime: string; isSlotAvailable: boolean;
                registrations: any[]; totalVotes: number; isVoted: boolean;
                scheduledMatchesCount: number; maxParallelMatches: number;
            };

            const formattedGrid: Record<string, ScheduleSlot[]> = {};
            for (const dateKey of dateKeys) {
                formattedGrid[dateKey] = rawSchedules.filter(rs => {
                    const d = rs.startTime;
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` === dateKey;
                }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime()).map(existing => ({
                    id: existing.id,
                    startTime: existing.startTime.toISOString(),
                    isSlotAvailable: existing.isAvailable ?? true,
                    registrations: [],
                    totalVotes: 0,
                    isVoted: false,
                    scheduledMatchesCount: scheduledCountMap.get(existing.id) || 0,
                    maxParallelMatches: activeSport.maxParallelMatches ?? 1
                }));
            }
            baseReturn.gridData = formattedGrid;
        }

        // --- TAB 2: Match Confirmation Data ---
        if (activeTab === 'confirm') {
            const [pendingMatchesRaw, allClassesRaw, staffUsersRaw, scheduledMatchesForSport, assignmentCounts] = await Promise.all([
                db.select({ match: matches, sport: sports })
                    .from(matches)
                    .innerJoin(sports, eq(matches.sportId, sports.id))
                    .where(and(
                        eq(matches.sportId, activeSport.id),
                        inArray(matches.status, ['PENDING_SCHEDULE', 'SCHEDULED']),
                        isNotNull(matches.classAId),
                        isNotNull(matches.classBId)
                    )),
                db.select().from(classes),
                db.select({
                    id: users.id, name: users.name, studentNumber: users.studentNumber,
                    isManager: users.isManager, isReferee: users.isReferee,
                }).from(users).where(or(eq(users.isManager, true), eq(users.isReferee, true))),
                db.select({ scheduleId: matches.scheduleId })
                    .from(matches)
                    .where(and(eq(matches.sportId, activeSport.id), eq(matches.status, 'SCHEDULED'))),
                db.select({
                    refereeId: matches.refereeId,
                    managerId: matches.managerId,
                }).from(matches).where(
                    or(isNotNull(matches.refereeId), isNotNull(matches.managerId))
                ),
            ]);

            // Build referee/manager assignment count maps
            const refereeCountMap = new Map<string, number>();
            const managerCountMap = new Map<string, number>();
            for (const row of assignmentCounts) {
                if (row.refereeId) refereeCountMap.set(row.refereeId, (refereeCountMap.get(row.refereeId) || 0) + 1);
                if (row.managerId) managerCountMap.set(row.managerId, (managerCountMap.get(row.managerId) || 0) + 1);
            }
            const staffUsers = staffUsersRaw.map(u => ({
                ...u,
                refereeCount: refereeCountMap.get(u.id) || 0,
                managerCount: managerCountMap.get(u.id) || 0,
            }));

            const classMap = new Map(allClassesRaw.map(c => [c.id, c.classNumber]));
            const scheduledCountMap = new Map<string, number>();
            for (const m of scheduledMatchesForSport) {
                if (m.scheduleId) scheduledCountMap.set(m.scheduleId, (scheduledCountMap.get(m.scheduleId) || 0) + 1);
            }

            const pendingMatches = pendingMatchesRaw.map(r => ({
                id: r.match.id, sportName: r.sport.name, matchName: r.match.name,
                classA: r.match.classAId ? classMap.get(r.match.classAId) : null,
                classB: r.match.classBId ? classMap.get(r.match.classBId) : null,
                classAId: r.match.classAId, classBId: r.match.classBId,
                scheduleWindowStart: r.match.scheduleWindowStart?.toISOString() ?? null,
                scheduleWindowEnd: r.match.scheduleWindowEnd?.toISOString() ?? null,
                scheduleWindowDeadline: r.match.scheduleWindowDeadline?.toISOString() ?? null,
                status: r.match.status,
                scheduleId: r.match.scheduleId,
                location: r.match.location,
                refereeId: r.match.refereeId,
                managerId: r.match.managerId
            }));

            let activeMatchId = url.searchParams.get('matchId');
            let activeMatch = pendingMatches.find(m => m.id === activeMatchId);
            if (!activeMatch && pendingMatches.length > 0) activeMatch = pendingMatches[0];

            type ScheduleSlot = {
                id: string; startTime: string; isSlotAvailable: boolean;
                registrations: any[]; totalVotes: number; isVoted: boolean;
                scheduledMatchesCount: number; maxParallelMatches: number;
            };

            let confirmGridData: Record<string, ScheduleSlot[]> = {};
            if (activeMatch) {
                const confirmRawData = await db.select({ schedule: schedules, register: registers, user: users })
                    .from(schedules)
                    .leftJoin(registers, and(eq(schedules.id, registers.scheduleId), eq(registers.isAvailable, true)))
                    .leftJoin(users, eq(registers.userId, users.id))
                    .where(eq(schedules.sportId, activeSport.id))
                    .orderBy(asc(schedules.startTime));

                const confirmGridMap = new Map<string, Map<string, ScheduleSlot>>();
                for (const row of confirmRawData) {
                    const isRelevantClass = row.register && (row.register.classId === activeMatch.classAId || row.register.classId === activeMatch.classBId);
                    const dateObj = row.schedule.startTime;
                    const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

                    if (!confirmGridMap.has(dateKey)) confirmGridMap.set(dateKey, new Map());
                    const daySlots = confirmGridMap.get(dateKey)!;
                    const schedId = row.schedule.id;

                    if (!daySlots.has(schedId)) {
                        daySlots.set(schedId, {
                            id: schedId, startTime: dateObj.toISOString(),
                            isSlotAvailable: row.schedule.isAvailable ?? true,
                            registrations: [], totalVotes: 0, isVoted: false,
                            scheduledMatchesCount: scheduledCountMap.get(schedId) || 0,
                            maxParallelMatches: activeSport.maxParallelMatches ?? 1
                        });
                    }

                    if (isRelevantClass && row.user) {
                        daySlots.get(schedId)!.registrations.push({
                            name: row.user.name ?? "익명", userId: row.user.id, classId: row.user.classId
                        });
                        daySlots.get(schedId)!.totalVotes++;
                    }
                }
                for (const [dateKey, mapSlots] of confirmGridMap.entries()) confirmGridData[dateKey] = Array.from(mapSlots.values());
            }

            baseReturn.completedClasses = pendingMatches;
            baseReturn.activeMatch = activeMatch;
            baseReturn.confirmGridData = confirmGridData;
            baseReturn.allUsers = staffUsers;
        }

        // --- TAB 3: Match Result Confirmation Data ---
        if (activeTab === 'result') {
            const [finishedMatchesRaw, allClassesRaw] = await Promise.all([
                db.select({ match: matches, sport: sports })
                    .from(matches)
                    .innerJoin(sports, eq(matches.sportId, sports.id))
                    .where(and(
                        eq(matches.sportId, activeSport.id),
                        eq(matches.status, 'FINISHED'),
                        eq(matches.isVerified, false)
                    )),
                db.select().from(classes),
            ]);

            const classMap = new Map(allClassesRaw.map(c => [c.id, c.classNumber]));
            const finishedMatches = finishedMatchesRaw.map(r => ({
                id: r.match.id, sportName: r.sport.name, matchName: r.match.name,
                classA: r.match.classAId ? classMap.get(r.match.classAId) : null,
                classB: r.match.classBId ? classMap.get(r.match.classBId) : null,
                classAId: r.match.classAId, classBId: r.match.classBId,
                scoreA: r.match.scoreA, scoreB: r.match.scoreB
            }));

            let activeResultMatchId = url.searchParams.get('resultMatchId');
            let baseResultMatch = finishedMatches.find(m => m.id === activeResultMatchId);
            if (!baseResultMatch && finishedMatches.length > 0) baseResultMatch = finishedMatches[0];

            let activeResultMatchDetails = null;
            if (baseResultMatch) {
                const [teamARoster, teamBRoster] = await Promise.all([
                    db.select({ userId: rosters.userId }).from(rosters)
                        .where(and(eq(rosters.classId, baseResultMatch.classAId!), eq(rosters.sportId, activeSport.id))),
                    db.select({ userId: rosters.userId }).from(rosters)
                        .where(and(eq(rosters.classId, baseResultMatch.classBId!), eq(rosters.sportId, activeSport.id))),
                ]);

                const teamAUserIds = new Set(teamARoster.map(r => r.userId));
                const teamBUserIds = new Set(teamBRoster.map(r => r.userId));

                const matchRecord = await db.select().from(matches).where(eq(matches.id, baseResultMatch.id)).limit(1);
                let matchRegisters: any[] = [];
                if (matchRecord.length > 0 && matchRecord[0].scheduleId) {
                    matchRegisters = await db.select({
                        registerId: registers.id, userId: users.id, name: users.name,
                        studentNumber: users.studentNumber, classId: users.classId
                    }).from(registers).innerJoin(users, eq(registers.userId, users.id))
                        .where(eq(registers.scheduleId, matchRecord[0].scheduleId!));
                }

                const teamACheckedIn: any[] = [];
                const teamBCheckedIn: any[] = [];
                const cheeringCheckedIn: any[] = [];
                for (const reg of matchRegisters) {
                    if (teamAUserIds.has(reg.userId)) teamACheckedIn.push(reg);
                    else if (teamBUserIds.has(reg.userId)) teamBCheckedIn.push(reg);
                    else cheeringCheckedIn.push(reg);
                }

                activeResultMatchDetails = {
                    id: baseResultMatch.id,
                    classAId: baseResultMatch.classAId, classBId: baseResultMatch.classBId,
                    classA: baseResultMatch.classA, classB: baseResultMatch.classB,
                    scoreA: baseResultMatch.scoreA, scoreB: baseResultMatch.scoreB,
                    status: 'FINISHED',
                    attendance: {
                        teamA: teamACheckedIn, teamB: teamBCheckedIn, cheering: cheeringCheckedIn,
                        teamATotal: activeSport.minPlayers, teamBTotal: activeSport.minPlayers
                    },
                    matchNotes: matchRecord[0]?.matchNotes,
                    recordStructure: activeSport.recordStructure
                };
            }

            baseReturn.finishedMatches = finishedMatches;
            baseReturn.activeResultMatch = activeResultMatchDetails;
        }

        return baseReturn;
    } catch (e) {
        if (e && typeof e === 'object' && 'status' in e && e.status === 302) {
            throw e;
        }
        console.error("FATAL: Loader Error in Admin Dashboard! Check DB connection and schema.");
        console.error(e);
        return {
            sports: [], activeSportId: null, gridData: {}, activeTab: 'schedule',
            completedClasses: [], activeMatch: null, confirmGridData: {}, allUsers: [],
            finishedMatches: [], activeResultMatch: null, eventState: "REGISTRATION" as EventState
        };
    }
};

export const actions: Actions = {
    toggleSlotAvailability: async ({ request, locals }) => {
        try {
            const user = locals.user;
            if (!user || !user.isAdmin) {
                return fail(403, { message: JSON.stringify({ ko: "권한이 없습니다.", en: "Permission denied." }) });
            }

            const formData = await request.formData();
            const slotId = formData.get('slotId')?.toString();

            if (!slotId) return fail(400, { message: JSON.stringify({ ko: "슬롯 ID가 누락되었습니다.", en: "Slot ID is missing." }) });

            if (slotId.startsWith('NEW_')) {
                const parts = slotId.split('_');
                const sportId = parts[1];
                const isoTime = parts.slice(2).join('_');
                const startTime = new Date(isoTime);

                await db.insert(schedules).values({
                    sportId,
                    startTime,
                    isAvailable: true
                });
                return { success: true };
            }

            const target = await db.select().from(schedules).where(eq(schedules.id, slotId)).limit(1);
            if (target.length === 0) return fail(404, { message: JSON.stringify({ ko: "슬롯을 찾을 수 없습니다.", en: "Slot not found." }) });

            const currentStatus = target[0].isAvailable ?? true;

            // If trying to reactivate, check if limit is already reached
            if (!currentStatus) {
                const sportId = target[0].sportId;
                const sportRow = await db.select({ maxParallelMatches: sports.maxParallelMatches }).from(sports).where(eq(sports.id, sportId)).limit(1);
                const limit = sportRow[0]?.maxParallelMatches ?? 1;

                const scheduledCount = await db.select({ id: matches.id })
                    .from(matches)
                    .where(and(
                        eq(matches.scheduleId, slotId),
                        eq(matches.status, 'SCHEDULED')
                    ));

                if (scheduledCount.length >= limit) {
                    return fail(400, { message: JSON.stringify({ ko: `동시 경기 가능 수(${limit})를 충족하여 활성화할 수 없습니다.`, en: `Cannot activate because the maximum parallel matches (${limit}) is reached.` }) });
                }
            }

            await db.update(schedules).set({ isAvailable: !currentStatus }).where(eq(schedules.id, slotId));

            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500, { message: JSON.stringify({ ko: "서버 처리 오류", en: "Server error" }) });
        }
    },
    updateSchedulePeriod: async ({ request, locals }) => {
        try {
            const user = locals.user;
            if (!user || !user.isAdmin) return fail(403, { message: JSON.stringify({ ko: "권한이 없습니다.", en: "Permission denied." }) });

            const formData = await request.formData();
            const sportId = formData.get('sportId')?.toString();
            const periodStart = formData.get('periodStart')?.toString();
            const periodEnd = formData.get('periodEnd')?.toString();

            if (!sportId) return fail(400);

            const startObj = periodStart ? new Date(periodStart) : null;
            const endObj = periodEnd ? new Date(periodEnd) : null;

            await db.update(sports).set({
                periodStart: startObj,
                periodEnd: endObj
            }).where(eq(sports.id, sportId));

            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500);
        }
    },
    processByeMatches: async ({ request, locals }) => {
        try {
            const user = locals.user;
            if (!user || !user.isAdmin) return fail(403, { message: "권한이 없습니다." });

            const formData = await request.formData();
            const sportId = formData.get('sportId')?.toString();
            if (!sportId) return fail(400, { message: JSON.stringify({ ko: '종목 ID 누락', en: 'Sport ID missing' }) });

            const allPending = await db.select().from(matches).where(
                and(eq(matches.sportId, sportId), eq(matches.status, 'PENDING_SCHEDULE'))
            );

            if (allPending.length === 0) return { success: true, processedCount: 0 };

            const matchIds = allPending.map(m => m.id).filter(id => id !== null) as string[];
            if (matchIds.length === 0) return { success: true, processedCount: 0 };

            const allNodes = await db.select().from(tournament_brackets).where(inArray(tournament_brackets.matchId, matchIds));
            const nodesByMatch = new Map<string, typeof allNodes>();
            for (const node of allNodes) {
                if (node.matchId) {
                    if (!nodesByMatch.has(node.matchId)) nodesByMatch.set(node.matchId, []);
                    nodesByMatch.get(node.matchId)!.push(node);
                }
            }

            const byeMatches = allPending.filter(m => {
                const nodes = nodesByMatch.get(m.id) || [];
                // If one side has isEliminatedSlot: true and no classId, it's a legitimate bye.
                return nodes.some(n => n.isEliminatedSlot && n.classId === null);
            });

            let count = 0;
            for (const match of byeMatches) {
                const nodes = nodesByMatch.get(match.id)!;
                const winnerNode = nodes.find(n => n.classId !== null);
                if (!winnerNode) continue; // Both sides bye? highly unlikely but skip.

                const winnerClassId = winnerNode.classId!;

                // Mark the match as finished and verified with the automatic winner
                await db.update(matches).set({
                    status: 'FINISHED',
                    winnerClassId,
                    isVerified: true
                }).where(eq(matches.id, match.id));

                // Update tournament_brackets for this match
                const bracketNodes = await db.select().from(tournament_brackets)
                    .where(eq(tournament_brackets.matchId, match.id));

                for (const node of bracketNodes) {
                    let newStatus: 'win' | 'lose' | 'default' = 'lose';

                    if (node.classId === winnerClassId) {
                        newStatus = 'win';

                        // Advance winner to next round
                        const nextRound = node.round + 1;
                        const nextPosition = Math.floor(node.position / 2);

                        const nextNodes = await db.select().from(tournament_brackets).where(and(
                            eq(tournament_brackets.sportId, node.sportId),
                            eq(tournament_brackets.round, nextRound),
                            eq(tournament_brackets.position, nextPosition)
                        ));

                        if (nextNodes.length > 0) {
                            await db.update(tournament_brackets)
                                .set({ classId: winnerClassId })
                                .where(eq(tournament_brackets.id, nextNodes[0].id));

                            // CALL SHARED HELPER
                            await syncBracketMatch(node.sportId, nextRound, nextPosition);
                        }
                    }

                    await db.update(tournament_brackets)
                        .set({ status: newStatus })
                        .where(eq(tournament_brackets.id, node.id));
                }

                count++;
            }

            // Propagate schedule windows for bye-advanced matches (Optional, syncBracketMatch handles this internally too)
            for (const match of byeMatches) {
                try { await propagateByeWindow(match.id); } catch (e) { console.error('propagateByeWindow error:', e); }
            }

            return { success: true, processedCount: count };
        } catch (e) {
            console.error('processByeMatches error:', e);
            return fail(500);
        }
    },
    finalizeMatch: async ({ request, locals }) => {
        try {
            const user = locals.user;
            if (!user || !user.isAdmin) return fail(403, { message: JSON.stringify({ ko: "권한이 없습니다.", en: "Permission denied." }) });

            const formData = await request.formData();
            const matchId = formData.get('matchId')?.toString();
            const scheduleId = formData.get('scheduleId')?.toString();
            const refereeId = formData.get('refereeId')?.toString();
            const managerId = formData.get('managerId')?.toString();
            const location = formData.get('location')?.toString();

            if (!matchId || !scheduleId) return fail(400, { message: JSON.stringify({ ko: "매치 ID 또는 스케줄 ID가 없습니다.", en: "Match ID or Schedule ID is missing." }) });

            // 1. Get sport info for concurrency limit
            const matchRow = await db.select({ sportId: matches.sportId, oldScheduleId: matches.scheduleId }).from(matches).where(eq(matches.id, matchId)).limit(1);
            if (matchRow.length === 0) return fail(404, { message: JSON.stringify({ ko: "매치를 찾을 수 없습니다.", en: "Match not found." }) });
            const sportId = matchRow[0].sportId;
            const oldScheduleId = matchRow[0].oldScheduleId;

            const sportRowInfo = await db.select({ maxParallelMatches: sports.maxParallelMatches }).from(sports).where(eq(sports.id, sportId)).limit(1);
            const limit = sportRowInfo[0]?.maxParallelMatches ?? 1;

            // 2. Set scheduledAt from the chosen schedule slot's startTime
            const scheduleRow = await db.select({ startTime: schedules.startTime })
                .from(schedules).where(eq(schedules.id, scheduleId)).limit(1);
            const scheduledAt = scheduleRow[0]?.startTime ?? null;

            await db.update(matches).set({
                scheduleId,
                status: 'SCHEDULED',
                scheduledAt,
                location: location || null,
                refereeId: refereeId || null,
                managerId: managerId || null
            }).where(eq(matches.id, matchId));

            // Trigger schedule window updates for the next round
            await computeOrUpdateNextMatchWindow(matchId);

            // 3. Check if limit reached and disable slot
            const scheduledCount = await db.select({ id: matches.id })
                .from(matches)
                .where(and(
                    eq(matches.scheduleId, scheduleId),
                    eq(matches.status, 'SCHEDULED')
                ));

            if (scheduledCount.length >= limit) {
                await db.update(schedules).set({ isAvailable: false }).where(eq(schedules.id, scheduleId));
            }

            // 4. Check old schedule and reactivate if necessary
            if (oldScheduleId && oldScheduleId !== scheduleId) {
                const oldScheduledCount = await db.select({ id: matches.id })
                    .from(matches)
                    .where(and(
                        eq(matches.scheduleId, oldScheduleId),
                        eq(matches.status, 'SCHEDULED')
                    ));

                if (oldScheduledCount.length < limit) {
                    await db.update(schedules).set({ isAvailable: true }).where(eq(schedules.id, oldScheduleId));
                }
            }

            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500);
        }
    },
    finalizeMatchResult: async ({ request, locals }) => {
        try {
            const user = locals.user;
            if (!user || !user.isAdmin) return fail(403, { message: JSON.stringify({ ko: "권한이 없습니다.", en: "Permission denied." }) });

            const formData = await request.formData();
            const matchId = formData.get('matchId')?.toString();
            const rawWinnerClassId = formData.get('winnerClassId')?.toString();

            if (!matchId || !rawWinnerClassId) return fail(400, { message: JSON.stringify({ ko: "매치 ID 또는 승자 데이터가 누락되었습니다.", en: "Match ID or winner data is missing." }) });

            const winnerClassId = rawWinnerClassId === 'none' ? null : rawWinnerClassId;

            // Mark match as verified and save winner (or null if both lose)
            await db.update(matches).set({
                winnerClassId,
                isVerified: true
            }).where(eq(matches.id, matchId));

            const currentNodes = await db.select().from(tournament_brackets).where(eq(tournament_brackets.matchId, matchId));

            if (currentNodes.length > 0) {
                const anyNode = currentNodes[0];
                const sportId = anyNode.sportId;



                for (const node of currentNodes) {
                    let newStatus: "win" | "lose" | "default" = "lose";

                    if (winnerClassId && node.classId === winnerClassId) {
                        newStatus = "win";

                        // Advance to the next round slot (Winner's progression)
                        const nextRound = node.round + 1;
                        let nextPosition = Math.floor(node.position / 2);

                        // Special mapping for Round 6 winners
                        if (node.round === 5) {
                            if (node.position < 2) nextPosition = 0;      // GF Winner -> 1st place (Pos 0)
                            else nextPosition = 2;                        // BM Winner -> 3rd place (Pos 2)
                        }

                        const nextNodeResult = await db.select().from(tournament_brackets).where(and(
                            eq(tournament_brackets.sportId, sportId),
                            eq(tournament_brackets.round, nextRound),
                            eq(tournament_brackets.position, nextPosition)
                        )).limit(1);

                        if (nextNodeResult.length > 0) {
                            await db.update(tournament_brackets)
                                .set({ classId: winnerClassId, isEliminatedSlot: false, status: 'default' })
                                .where(eq(tournament_brackets.id, nextNodeResult[0].id));

                            // CALL SHARED HELPER
                            await syncBracketMatch(sportId, nextRound, nextPosition);
                        }
                    } else if (winnerClassId && node.classId !== winnerClassId) {
                        if (node.round === 4) {
                            // Advance Semifinal LOSERS to the Bronze Match (Round 5, Positions 2 and 3)
                            const nextRound = 5;
                            const nextPosition = Math.floor(node.position / 2) + 2;

                            const bronzeNodeResult = await db.select().from(tournament_brackets).where(and(
                                eq(tournament_brackets.sportId, sportId),
                                eq(tournament_brackets.round, nextRound),
                                eq(tournament_brackets.position, nextPosition)
                            )).limit(1);

                            if (bronzeNodeResult.length > 0) {
                                await db.update(tournament_brackets)
                                    .set({ classId: node.classId, isEliminatedSlot: false, status: 'default' })
                                    .where(eq(tournament_brackets.id, bronzeNodeResult[0].id));

                                // CALL SHARED HELPER
                                await syncBracketMatch(sportId, nextRound, nextPosition);
                            }
                        } else if (node.round === 5 && node.position < 2) {
                            // Advance GF LOSER to 2nd place (Round 6, Position 1)
                            const nextRound = 6;
                            const nextPosition = 1;

                            const runnerUpNodeResult = await db.select().from(tournament_brackets).where(and(
                                eq(tournament_brackets.sportId, sportId),
                                eq(tournament_brackets.round, nextRound),
                                eq(tournament_brackets.position, nextPosition)
                            )).limit(1);

                            if (runnerUpNodeResult.length > 0) {
                                await db.update(tournament_brackets)
                                    .set({ classId: node.classId, isEliminatedSlot: false, status: 'default' })
                                    .where(eq(tournament_brackets.id, runnerUpNodeResult[0].id));

                                // Result column has no matches, but we call sync for consistency (will return early)
                                await syncBracketMatch(sportId, nextRound, nextPosition);
                            }
                        }
                    }

                    await db.update(tournament_brackets)
                        .set({ status: newStatus })
                        .where(eq(tournament_brackets.id, node.id));
                }

                // If both lose
                if (!winnerClassId) {
                    const nextRound = anyNode.round + 1;
                    const nextPosition = Math.floor(anyNode.position / 2);

                    const nextNodeResult = await db.select().from(tournament_brackets).where(and(
                        eq(tournament_brackets.sportId, sportId),
                        eq(tournament_brackets.round, nextRound),
                        eq(tournament_brackets.position, nextPosition)
                    )).limit(1);

                    if (nextNodeResult.length > 0) {
                        await db.update(tournament_brackets)
                            .set({ isEliminatedSlot: true, classId: null })
                            .where(eq(tournament_brackets.id, nextNodeResult[0].id));

                        await syncBracketMatch(sportId, nextRound, nextPosition);
                    }

                    // If it was the semifinal and both lose, eliminate both bronze slots
                    if (anyNode.round === 4) {
                        const bronzePos1 = Math.floor((anyNode.position * 2) / 2) + 2; // Position 2
                        const bronzePos2 = Math.floor(((anyNode.position * 2) + 1) / 2) + 2; // Position 3

                        await db.update(tournament_brackets)
                            .set({ isEliminatedSlot: true, classId: null })
                            .where(and(
                                eq(tournament_brackets.sportId, sportId),
                                eq(tournament_brackets.round, 5),
                                inArray(tournament_brackets.position, [bronzePos1, bronzePos2])
                            ));

                        await syncBracketMatch(sportId, 5, bronzePos1);
                        await syncBracketMatch(sportId, 5, bronzePos2);
                    }
                }
            }

            // Auto-compute schedule window for the next-round match
            if (winnerClassId) {
                try { await computeOrUpdateNextMatchWindow(matchId); } catch (e) { console.error('computeOrUpdateNextMatchWindow error:', e); }
            }

            return { success: true };
        } catch (e) {
            console.error("Bracket progression error:", e);
            return fail(500);
        }
    },
    setRound1Schedule: async ({ request, locals }) => {
        try {
            const user = locals.user;
            if (!user?.isAdmin) return fail(403);

            const formData = await request.formData();
            const sportId = formData.get('sportId')?.toString();
            const selectionStart = formData.get('selectionStart')?.toString();
            const selectionEnd = formData.get('selectionEnd')?.toString();
            const deadline = formData.get('deadline')?.toString();
            const periodStart = formData.get('periodStart')?.toString();
            const periodEnd = formData.get('periodEnd')?.toString();
            const dailyStartTime = formData.get('dailyStartTime')?.toString();
            const dailyEndTime = formData.get('dailyEndTime')?.toString();
            const timeSlotInterval = formData.get('timeSlotInterval')?.toString();
            const maxParallelMatches = formData.get('maxParallelMatches')?.toString();
            const requiredGender = formData.get('requiredGender')?.toString();

            if (!sportId) return fail(400, { message: JSON.stringify({ ko: '종목 ID가 누락되었습니다.', en: 'Sport ID is missing.' }) });
            const sId = sportId as string;

            const updatePayload: Record<string, any> = {};
            if (periodStart) updatePayload.periodStart = new Date(periodStart);
            if (periodEnd) updatePayload.periodEnd = new Date(periodEnd);
            if (selectionStart) updatePayload.round1SelectionStart = new Date(selectionStart);
            if (selectionEnd) updatePayload.round1SelectionEnd = new Date(selectionEnd);
            if (deadline) updatePayload.round1Deadline = new Date(deadline);
            if (dailyStartTime) updatePayload.dailyStartTime = dailyStartTime;
            if (dailyEndTime) updatePayload.dailyEndTime = dailyEndTime;
            if (timeSlotInterval) updatePayload.timeSlotInterval = parseInt(timeSlotInterval);
            if (maxParallelMatches) updatePayload.maxParallelMatches = parseInt(maxParallelMatches);
            if (requiredGender) updatePayload.requiredGender = requiredGender;

            // 1. Save per-sport config
            await db.update(sports).set(updatePayload).where(eq(sports.id, sId));

            // 2. Sync Schedule Slots based on FULL sport period
            // (Uses updated dailyStartTime/EndTime/Interval internally)
            const sRecord = await db.select().from(sports).where(eq(sports.id, sId)).limit(1);
            if (sRecord[0].periodStart && sRecord[0].periodEnd) {
                await ensureScheduleSlots(sId, new Date(sRecord[0].periodStart), new Date(sRecord[0].periodEnd), true);
            }

            // 3. Update Round-1 window for qualifying matches
            if (selectionStart && deadline) {
                const startDate = new Date(selectionStart);
                const deadlineDate = new Date(deadline);
                const endDate = selectionEnd ? new Date(selectionEnd) : new Date(deadline);
                endDate.setHours(23, 59, 59, 999);

                const allPendingMatches = await db.select({ id: matches.id }).from(matches)
                    .where(and(eq(matches.status, 'PENDING_SCHEDULE'), eq(matches.sportId, sId)));

                // Bulk-fetch bracket nodes for all pending matches to avoid N+1 queries
                const pendingMatchIds = allPendingMatches.map(m => m.id);
                const allBracketNodes = pendingMatchIds.length > 0
                    ? await db.select({ matchId: tournament_brackets.matchId, round: tournament_brackets.round })
                        .from(tournament_brackets)
                        .where(inArray(tournament_brackets.matchId, pendingMatchIds))
                    : [];

                const bracketRoundMap = new Map<string, number>();
                for (const node of allBracketNodes) {
                    if (node.matchId) bracketRoundMap.set(node.matchId, node.round);
                }

                for (const m of allPendingMatches) {
                    if (bracketRoundMap.get(m.id) === 1) {
                        await db.update(matches).set({
                            scheduleWindowStart: startDate,
                            scheduleWindowEnd: endDate,
                            scheduleWindowDeadline: deadlineDate
                        }).where(eq(matches.id, m.id));
                    }
                }
            }

            return { success: true };
        } catch (e) {
            console.error('setRound1Schedule error:', e);
            return fail(500);
        }
    },
    setEventState: async ({ request, locals }) => {
        try {
            const user = locals.user;
            if (!user?.isAdmin) return fail(403);

            const formData = await request.formData();
            const newState = formData.get('eventState')?.toString() as 'REGISTRATION' | 'ONGOING' | 'COMPLETED' | undefined;
            const validStates = ['REGISTRATION', 'ONGOING', 'COMPLETED'];
            if (!newState || !validStates.includes(newState)) return fail(400, { message: JSON.stringify({ ko: '유효하지 않은 상태입니다.', en: 'Invalid state.' }) });

            const existing = await db.select().from(system_config).limit(1);
            if (existing.length > 0) {
                await db.update(system_config).set({ eventState: newState, updatedAt: new Date() });
            } else {
                await db.insert(system_config).values({ eventState: newState });
            }

            return { success: true, eventState: newState };
        } catch (e) {
            console.error('setEventState error:', e);
            return fail(500);
        }
    },
    setRegistrationDeadline: async ({ request, locals }) => {
        try {
            const user = locals.user;
            if (!user?.isAdmin) return fail(403);

            const formData = await request.formData();
            const deadline = formData.get('registrationDeadline')?.toString();

            if (!deadline) return fail(400, { message: JSON.stringify({ ko: '마감 기한을 입력해주세요.', en: 'Please enter the deadline.' }) });

            const deadlineDate = new Date(deadline);
            if (isNaN(deadlineDate.getTime())) return fail(400, { message: JSON.stringify({ ko: '유효하지 않은 날짜 형식입니다.', en: 'Invalid date format.' }) });

            const existing = await db.select().from(system_config).limit(1);
            if (existing.length > 0) {
                await db.update(system_config).set({ registrationDeadline: deadlineDate, updatedAt: new Date() });
            } else {
                await db.insert(system_config).values({ registrationDeadline: deadlineDate });
            }

            return { success: true };
        } catch (e) {
            console.error('setRegistrationDeadline error:', e);
            return fail(500);
        }
    },
    addSportLocation: async ({ request, locals }) => {
        try {
            const user = locals.user;
            if (!user?.isAdmin) return fail(403);

            const formData = await request.formData();
            const sportId = formData.get('sportId')?.toString();
            const nameKo = formData.get('nameKo')?.toString();
            const nameEn = formData.get('nameEn')?.toString();

            if (!sportId || !nameKo || !nameEn) return fail(400, { message: JSON.stringify({ ko: '현/영 장소 이름을 모두 입력해주세요.', en: 'Please enter both KO/EN location names.' }) });

            await db.insert(sport_locations).values({
                sportId,
                name: JSON.stringify({ ko: nameKo, en: nameEn })
            });

            return { success: true };
        } catch (e) {
            console.error('addSportLocation error:', e);
            return fail(500);
        }
    },
    deleteSportLocation: async ({ request, locals }) => {
        try {
            const user = locals.user;
            if (!user?.isAdmin) return fail(403);

            const formData = await request.formData();
            const locationId = formData.get('locationId')?.toString();

            if (!locationId) return fail(400, { message: JSON.stringify({ ko: '장소 ID가 누락되었습니다.', en: 'Location ID is missing.' }) });

            await db.delete(sport_locations).where(eq(sport_locations.id, locationId));

            return { success: true };
        } catch (e) {
            console.error('deleteSportLocation error:', e);
            return fail(500);
        }
    },

    impersonate: async ({ request, locals, cookies }) => {
        try {
            const user = locals.user;
            if (!user?.isAdmin) return fail(403, { message: JSON.stringify({ ko: '관리자 권한이 필요합니다.', en: 'Admin permission required.' }) });

            const formData = await request.formData();
            const studentNumber = formData.get('studentNumber')?.toString()?.trim();

            if (!studentNumber) return fail(400, { message: JSON.stringify({ ko: '학번을 입력해주세요.', en: 'Please enter student ID.' }) });

            // Look up target user
            const targetUsers = await db.select()
                .from(users)
                .where(eq(users.studentNumber, studentNumber))
                .limit(1);

            if (targetUsers.length === 0) {
                return fail(404, { message: JSON.stringify({ ko: `학번 ${studentNumber}에 해당하는 유저를 찾을 수 없습니다.`, en: `Could not find user with student ID ${studentNumber}.` }) });
            }

            const targetUser = targetUsers[0];

            // Backup current admin session
            const currentToken = cookies.get('session');
            if (currentToken) {
                cookies.set('admin_session', currentToken, {
                    path: '/',
                    httpOnly: true,
                    secure: !dev,
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 // 1 day
                });
            }

            // Sign new JWT for target user
            const newToken = signToken({
                uid: targetUser.authId || '',
                sid: '',
                studentNumber: targetUser.studentNumber,
                dbUserId: targetUser.id,
            });

            cookies.set('session', newToken, {
                path: '/',
                httpOnly: true,
                secure: !dev,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7
            });

            throw redirect(303, '/');
        } catch (e) {
            if (e && typeof e === 'object' && 'status' in e) throw e;
            console.error('impersonate error:', e);
            return fail(500, { message: JSON.stringify({ ko: '임퍼소네이션 중 오류가 발생했습니다.', en: 'Error occurred during impersonation.' }) });
        }
    },

    stopImpersonate: async ({ cookies }) => {
        try {
            const adminToken = cookies.get('admin_session');
            if (!adminToken) {
                throw redirect(303, '/');
            }

            // Verify the admin token is still valid
            const payload = verifyToken(adminToken);
            if (!payload) {
                cookies.delete('admin_session', { path: '/' });
                throw redirect(303, '/login');
            }

            // Verify the backed-up session actually belongs to an admin
            const adminUsers = await db.select()
                .from(users)
                .where(eq(users.id, payload.dbUserId))
                .limit(1);

            if (adminUsers.length === 0 || !adminUsers[0].isAdmin) {
                // Invalid or non-admin session in backup — discard it
                cookies.delete('admin_session', { path: '/' });
                throw redirect(303, '/');
            }

            // Restore admin session
            cookies.set('session', adminToken, {
                path: '/',
                httpOnly: true,
                secure: !dev,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7
            });

            cookies.delete('admin_session', { path: '/' });

            throw redirect(303, '/admin');
        } catch (e) {
            if (e && typeof e === 'object' && 'status' in e) throw e;
            console.error('stopImpersonate error:', e);
            return fail(500, { message: JSON.stringify({ ko: '관리자 복귀 중 오류가 발생했습니다.', en: 'Error occurred during return to admin.' }) });
        }
    }
};
