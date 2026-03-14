import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sports, schedules, registers, users, rosters, matches, classes, tournament_brackets, system_config, type EventState } from '$lib/server/db/schema';
import { eq, and, asc, isNull, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { PageServerLoad, Actions } from './$types';
import { computeOrUpdateNextMatchWindow, propagateByeWindow, addWeekdays, ensureScheduleSlots } from '$lib/server/scheduleWindowHelper';

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

        // Fetch event state for system tab
        const configRows = await db.select().from(system_config).limit(1);
        const eventState = (configRows[0]?.eventState ?? 'REGISTRATION') as EventState;
        const registrationDeadline = configRows[0]?.registrationDeadline ?? null;


        // --- TAB 1: Schedule Configuration Data ---
        let requestedSportId = url.searchParams.get('sportId');

        const allSports = await db.select().from(sports).orderBy(asc(sports.displayOrder));
        if (allSports.length === 0) {
            return {
                sports: [], activeSportId: null, gridData: {}, periodStart: null, periodEnd: null,
                completedClasses: [], activeClassPair: null, confirmGridData: {}, allUsers: [],
                finishedMatches: [], activeResultMatch: null, eventState: 'REGISTRATION'
            };
        }

        let activeSport = allSports.find(s => s.id === requestedSportId) || allSports[0];

        // Fetch all schedules for grid (Dynamically bounded by DB data)
        const rawSchedules = await db.select()
            .from(schedules)
            .where(eq(schedules.sportId, activeSport.id))
            .orderBy(asc(schedules.startTime));

        // Get count of scheduled matches for each slot
        const scheduledMatchesForSport = await db.select({
            scheduleId: matches.scheduleId,
        })
            .from(matches)
            .where(and(
                eq(matches.sportId, activeSport.id),
                eq(matches.status, 'SCHEDULED')
            ));

        const scheduledCountMap = new Map<string, number>();
        for (const m of scheduledMatchesForSport) {
            if (m.scheduleId) {
                scheduledCountMap.set(m.scheduleId, (scheduledCountMap.get(m.scheduleId) || 0) + 1);
            }
        }

        // Create date keys for grouping
        const dateKeys = Array.from(new Set(rawSchedules.map(rs => {
            const d = rs.startTime;
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }))).sort();

        type ScheduleSlot = {
            id: string;
            startTime: string;
            isSlotAvailable: boolean;
            registrations: any[];
            totalVotes: number;
            isVoted: boolean;
            scheduledMatchesCount: number;
            maxParallelMatches: number;
        };

        const formattedGrid: Record<string, ScheduleSlot[]> = {};

        // Calculate start and end bounds based on periodStart and periodEnd
        const startDate = activeSport.periodStart ? new Date(activeSport.periodStart) : new Date();
        const endDate = activeSport.periodEnd ? new Date(activeSport.periodEnd) : new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        // Generate grid bounded ONLY by existing DB records
        // (dateKeys are already calculated above)

        for (const dateKey of dateKeys) {
            const daySlots: ScheduleSlot[] = [];
            // Filter schedules matching this date
            const matchingSchedules = rawSchedules.filter(rs => {
                const d = rs.startTime;
                const dk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                return dk === dateKey;
            }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

            for (const existing of matchingSchedules) {
                daySlots.push({
                    id: existing.id,
                    startTime: existing.startTime.toISOString(),
                    isSlotAvailable: existing.isAvailable ?? true,
                    registrations: [],
                    totalVotes: 0,
                    isVoted: false,
                    scheduledMatchesCount: scheduledCountMap.get(existing.id) || 0,
                    maxParallelMatches: activeSport.maxParallelMatches ?? 1
                });
            }
            formattedGrid[dateKey] = daySlots;
        }

        // --- TAB 2: Match Confirmation Data ---
        const pendingMatchesRaw = await db.select({
            match: matches,
            sport: sports,
        })
            .from(matches)
            .innerJoin(sports, eq(matches.sportId, sports.id))
            .where(
                and(
                    eq(matches.sportId, activeSport.id),
                    eq(matches.status, 'PENDING_SCHEDULE')
                )
            );

        const allClassesRaw = await db.select().from(classes);
        const classMap = new Map(allClassesRaw.map(c => [c.id, c.classNumber]));

        const pendingMatches = pendingMatchesRaw.map(r => ({
            id: r.match.id,
            sportName: r.sport.name,
            matchName: r.match.name,
            classA: r.match.classAId ? classMap.get(r.match.classAId) : null,
            classB: r.match.classBId ? classMap.get(r.match.classBId) : null,
            classAId: r.match.classAId,
            classBId: r.match.classBId
        }));

        let activeMatchId = url.searchParams.get('matchId');
        let activeMatch = pendingMatches.find(m => m.id === activeMatchId);
        if (!activeMatch && pendingMatches.length > 0) activeMatch = pendingMatches[0];

        let confirmGridData: Record<string, ScheduleSlot[]> = {};

        if (activeMatch) {
            const confirmRawData = await db.select({
                schedule: schedules,
                register: registers,
                user: users
            })
                .from(schedules)
                .leftJoin(registers, and(
                    eq(schedules.id, registers.scheduleId),
                    eq(registers.isAvailable, true)
                ))
                .leftJoin(users, eq(registers.userId, users.id))
                .where(eq(schedules.sportId, activeSport.id))
                .orderBy(asc(schedules.startTime));

            const confirmGridMap = new Map<string, Map<string, ScheduleSlot>>();
            for (const row of confirmRawData) {
                // Determine if this register is from classA or classB
                const isRelevantClass = row.register && (row.register.classId === activeMatch.classAId || row.register.classId === activeMatch.classBId);

                const dateObj = row.schedule.startTime;
                const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

                if (!confirmGridMap.has(dateKey)) confirmGridMap.set(dateKey, new Map());
                const daySlots = confirmGridMap.get(dateKey)!;
                const schedId = row.schedule.id;

                if (!daySlots.has(schedId)) {
                    daySlots.set(schedId, {
                        id: schedId,
                        startTime: dateObj.toISOString(),
                        isSlotAvailable: row.schedule.isAvailable ?? true,
                        registrations: [],
                        totalVotes: 0,
                        isVoted: false,
                        scheduledMatchesCount: scheduledCountMap.get(schedId) || 0,
                        maxParallelMatches: activeSport.maxParallelMatches ?? 1
                    });
                }

                if (isRelevantClass && row.user) {
                    daySlots.get(schedId)!.registrations.push({
                        name: row.user.name ?? "익명",
                        userId: row.user.id,
                        classId: row.user.classId
                    });
                    daySlots.get(schedId)!.totalVotes++;
                }
            }

            for (const [dateKey, mapSlots] of confirmGridMap.entries()) confirmGridData[dateKey] = Array.from(mapSlots.values());
        }

        const staffUsers = await db.select().from(users).where(or(eq(users.isManager, true), eq(users.isReferee, true)));

        // --- TAB 3: Match Result Confirmation Data ---
        const finishedMatchesRaw = await db.select({
            match: matches,
            sport: sports,
        })
            .from(matches)
            .innerJoin(sports, eq(matches.sportId, sports.id))
            .where(
                and(
                    eq(matches.sportId, activeSport.id),
                    eq(matches.status, 'FINISHED'),
                    eq(matches.isVerified, false)
                )
            );

        const finishedMatches = finishedMatchesRaw.map(r => ({
            id: r.match.id,
            sportName: r.sport.name,
            matchName: r.match.name,
            classA: r.match.classAId ? classMap.get(r.match.classAId) : null,
            classB: r.match.classBId ? classMap.get(r.match.classBId) : null,
            classAId: r.match.classAId,
            classBId: r.match.classBId,
            scoreA: r.match.scoreA,
            scoreB: r.match.scoreB
        }));

        let activeResultMatchId = url.searchParams.get('resultMatchId');
        let baseResultMatch = finishedMatches.find(m => m.id === activeResultMatchId);
        if (!baseResultMatch && finishedMatches.length > 0) baseResultMatch = finishedMatches[0];

        let activeResultMatchDetails = null;

        if (baseResultMatch) {
            // Reconstruct attendance to feed to MatchLogPanel correctly
            const teamARoster = await db
                .select({ userId: rosters.userId })
                .from(rosters)
                .where(and(eq(rosters.classId, baseResultMatch.classAId!), eq(rosters.sportId, activeSport.id)));

            const teamBRoster = await db
                .select({ userId: rosters.userId })
                .from(rosters)
                .where(and(eq(rosters.classId, baseResultMatch.classBId!), eq(rosters.sportId, activeSport.id)));

            const teamAUserIds = new Set(teamARoster.map(r => r.userId));
            const teamBUserIds = new Set(teamBRoster.map(r => r.userId));

            // Fetch ACTUAL registers for this specific match's schedule
            const matchRecord = await db.select().from(matches).where(eq(matches.id, baseResultMatch.id)).limit(1);
            let matchRegisters: any[] = [];

            if (matchRecord.length > 0 && matchRecord[0].scheduleId) {
                matchRegisters = await db
                    .select({
                        registerId: registers.id,
                        userId: users.id,
                        name: users.name,
                        studentNumber: users.studentNumber,
                        classId: users.classId
                    })
                    .from(registers)
                    .innerJoin(users, eq(registers.userId, users.id))
                    .where(eq(registers.scheduleId, matchRecord[0].scheduleId!));
            }

            const teamACheckedIn = [];
            const teamBCheckedIn = [];
            const cheeringCheckedIn = [];

            for (const reg of matchRegisters) {
                if (teamAUserIds.has(reg.userId)) {
                    teamACheckedIn.push(reg);
                } else if (teamBUserIds.has(reg.userId)) {
                    teamBCheckedIn.push(reg);
                } else {
                    cheeringCheckedIn.push(reg);
                }
            }

            activeResultMatchDetails = {
                id: baseResultMatch.id,
                classAId: baseResultMatch.classAId,
                classBId: baseResultMatch.classBId,
                classA: baseResultMatch.classA,
                classB: baseResultMatch.classB,
                scoreA: baseResultMatch.scoreA,
                scoreB: baseResultMatch.scoreB,
                status: 'FINISHED',
                attendance: {
                    teamA: teamACheckedIn,
                    teamB: teamBCheckedIn,
                    cheering: cheeringCheckedIn,
                    teamATotal: activeSport.minPlayers,
                    teamBTotal: activeSport.minPlayers
                },
                matchNotes: matchRecord[0]?.matchNotes
            };
        }

        return {
            sports: allSports,
            activeSportId: activeSport.id,
            gridData: formattedGrid,
            activeTab: url.searchParams.get('tab'),

            completedClasses: pendingMatches,
            activeMatch,
            confirmGridData,
            allUsers: staffUsers,

            finishedMatches,
            activeResultMatch: activeResultMatchDetails,
            eventState,
            registrationDeadline
        };
    } catch (e) {
        if (e && typeof e === 'object' && 'status' in e && e.status === 302) {
            throw e;
        }
        console.error("FATAL: Loader Error in Admin Dashboard! Check DB connection and schema.");
        console.error(e);
        return {
            sports: [], activeSportId: null, gridData: {},
            completedClasses: [], activeMatch: null, confirmGridData: {}, allUsers: [],
            finishedMatches: [], activeResultMatch: null, eventState: "REGISTRATION" as EventState
        };
    }
};

export const actions: Actions = {
    toggleSlotAvailability: async ({ request, locals }) => {
        try {
            const user = locals.user;
            if (!user || (!user.isManager && !user.isAdmin)) {
                return fail(403, { message: "권한이 없습니다." });
            }

            const formData = await request.formData();
            const slotId = formData.get('slotId')?.toString();

            if (!slotId) return fail(400, { message: "슬롯 ID가 누락되었습니다." });

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
            if (target.length === 0) return fail(404, { message: "슬롯을 찾을 수 없습니다." });

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
                    return fail(400, { message: `동시 경기 가능 수(${limit})를 충족하여 활성화할 수 없습니다.` });
                }
            }

            await db.update(schedules).set({ isAvailable: !currentStatus }).where(eq(schedules.id, slotId));

            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500, { message: "서버 처리 오류" });
        }
    },
    updateSchedulePeriod: async ({ request, locals }) => {
        try {
            const user = locals.user;
            if (!user || (!user.isManager && !user.isAdmin)) return fail(403);

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
            if (!user || (!user.isManager && !user.isAdmin)) return fail(403);

            const formData = await request.formData();
            const sportId = formData.get('sportId')?.toString();
            if (!sportId) return fail(400, { message: '종목 ID 누락' });

            // Find all PENDING_SCHEDULE matches where exactly one class slot is null (bye match)
            const allPending = await db.select().from(matches).where(
                and(eq(matches.sportId, sportId), eq(matches.status, 'PENDING_SCHEDULE'))
            );

            const byeMatches = allPending.filter(m =>
                (m.classAId === null && m.classBId !== null) ||
                (m.classAId !== null && m.classBId === null)
            );

            let count = 0;
            for (const match of byeMatches) {
                const winnerClassId = match.classAId ?? match.classBId!;

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
                        }
                    }

                    await db.update(tournament_brackets)
                        .set({ status: newStatus })
                        .where(eq(tournament_brackets.id, node.id));
                }

                count++;
            }

            // Propagate schedule windows for bye-advanced matches
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
            if (!user || (!user.isManager && !user.isAdmin)) return fail(403);

            const formData = await request.formData();
            const matchId = formData.get('matchId')?.toString();
            const scheduleId = formData.get('scheduleId')?.toString();
            const refereeId = formData.get('refereeId')?.toString();
            const managerId = formData.get('managerId')?.toString();

            if (!matchId || !scheduleId) return fail(400, { message: "매치 ID 또는 스케줄 ID가 없습니다." });

            // 1. Get sport info for concurrency limit
            const matchRow = await db.select({ sportId: matches.sportId }).from(matches).where(eq(matches.id, matchId)).limit(1);
            if (matchRow.length === 0) return fail(404, { message: "매치를 찾을 수 없습니다." });
            const sportId = matchRow[0].sportId;

            const sportRow = await db.select({ maxParallelMatches: sports.maxParallelMatches }).from(sports).where(eq(sports.id, sportId)).limit(1);
            const limit = sportRow[0]?.maxParallelMatches ?? 1;

            // 2. Set scheduledAt from the chosen schedule slot's startTime
            const scheduleRow = await db.select({ startTime: schedules.startTime })
                .from(schedules).where(eq(schedules.id, scheduleId)).limit(1);
            const scheduledAt = scheduleRow[0]?.startTime ?? null;

            await db.update(matches).set({
                scheduleId,
                status: 'SCHEDULED',
                scheduledAt,
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

            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500);
        }
    },
    finalizeMatchResult: async ({ request, locals }) => {
        try {
            const user = locals.user;
            if (!user || (!user.isManager && !user.isAdmin)) return fail(403);

            const formData = await request.formData();
            const matchId = formData.get('matchId')?.toString();
            const rawWinnerClassId = formData.get('winnerClassId')?.toString();

            if (!matchId || !rawWinnerClassId) return fail(400, { message: "매치 ID 또는 승자 데이터가 누락되었습니다." });

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

                // Bracket progression logic helper
                const propagateBracketProgress = async (round: number, position: number) => {
                    const nextRound = round + 1;
                    const nextPosition = Math.floor(position / 2);

                    // 1. Get the target node for the next round
                    const [targetNode] = await db.select().from(tournament_brackets).where(and(
                        eq(tournament_brackets.sportId, sportId),
                        eq(tournament_brackets.round, nextRound),
                        eq(tournament_brackets.position, nextPosition)
                    )).limit(1);

                    if (!targetNode) return; // Top of bracket reached

                    // 2. Find both slots for the targetNode's level (to see if match can be formed)
                    const pIdx = Math.floor(nextPosition / 2);
                    const s1Pos = pIdx * 2;
                    const s2Pos = pIdx * 2 + 1;

                    const matchSlots = await db.select().from(tournament_brackets).where(and(
                        eq(tournament_brackets.sportId, sportId),
                        eq(tournament_brackets.round, nextRound),
                        or(eq(tournament_brackets.position, s1Pos), eq(tournament_brackets.position, s2Pos))
                    ));

                    if (matchSlots.length !== 2) return;

                    const s1 = matchSlots.find(s => s.position === s1Pos)!;
                    const s2 = matchSlots.find(s => s.position === s2Pos)!;

                    // 3. Check for special cases: Auto-win or Double-elimination
                    const classA = s1.classId;
                    const classB = s2.classId;
                    const isAExcl = s1.isEliminatedSlot;
                    const isBExcl = s2.isEliminatedSlot;

                    let autoWinnerId: string | null = null;
                    let bothEliminated = false;
                    let hasInertOpponent = false;

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

                    // Handle the match record for this round
                    let mId = s1.matchId || s2.matchId;

                    if (hasInertOpponent) {
                        // This match is "Automated"
                        const winnerId = bothEliminated ? null : autoWinnerId;

                        if (!mId) {
                            const [newMatch] = await db.insert(matches).values({
                                sportId,
                                status: 'FINISHED',
                                isVerified: true,
                                name: `Round ${nextRound} - Match ${pIdx + 1}`,
                                classAId: classA,
                                classBId: classB,
                                winnerClassId: winnerId,
                                matchNotes: bothEliminated ? '양측 우승자 없음으로 인한 동시 탈락' : '상대측 우승자 없음으로 인한 부전승/자동승리'
                            }).returning({ id: matches.id });
                            mId = newMatch.id;

                            await db.update(tournament_brackets)
                                .set({ matchId: mId })
                                .where(and(
                                    eq(tournament_brackets.sportId, sportId),
                                    eq(tournament_brackets.round, nextRound),
                                    or(eq(tournament_brackets.position, s1Pos), eq(tournament_brackets.position, s2Pos))
                                ));
                        } else {
                            await db.update(matches).set({
                                status: 'FINISHED',
                                isVerified: true,
                                classAId: classA,
                                classBId: classB,
                                winnerClassId: winnerId,
                                matchNotes: bothEliminated ? '양측 우승자 없음으로 인한 동시 탈락' : '상대측 우승자 없음으로 인한 부전승/자동승리'
                            }).where(eq(matches.id, mId));
                        }

                        // Advance to next round recursively
                        const nextTargetRound = nextRound + 1;
                        const nextTargetPosition = Math.floor(nextPosition / 2);
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

                            // Set win/lose status for current nodes
                            await db.update(tournament_brackets).set({ status: classA === winnerId && winnerId ? 'win' : 'lose' }).where(eq(tournament_brackets.id, s1.id));
                            await db.update(tournament_brackets).set({ status: classB === winnerId && winnerId ? 'win' : 'lose' }).where(eq(tournament_brackets.id, s2.id));

                            await propagateBracketProgress(nextRound, nextPosition);
                        }
                        // Trigger schedule window updates for the newly finished/updated automated match
                        if (mId) {
                            try { await propagateByeWindow(mId); } catch (e) { console.error('propagateByeWindow error:', e); }
                        }
                    } else if (classA || classB) {
                        // Create match even if only one side is decided
                        if (!mId) {
                            const [newMatch] = await db.insert(matches).values({
                                sportId,
                                status: 'PENDING_SCHEDULE',
                                name: `Round ${nextRound} - Match ${pIdx + 1}`,
                                classAId: classA,
                                classBId: classB,
                            }).returning({ id: matches.id });
                            mId = newMatch.id;

                            await db.update(tournament_brackets)
                                .set({ matchId: mId })
                                .where(and(
                                    eq(tournament_brackets.sportId, sportId),
                                    eq(tournament_brackets.round, nextRound),
                                    or(eq(tournament_brackets.position, s1Pos), eq(tournament_brackets.position, s2Pos))
                                ));
                        } else {
                            await db.update(matches)
                                .set({ classAId: classA, classBId: classB })
                                .where(eq(matches.id, mId));
                        }
                        // Trigger schedule window updates for the newly created partial match
                        if (mId) await computeOrUpdateNextMatchWindow(mId);
                    }
                };

                for (const node of currentNodes) {
                    let newStatus: "win" | "lose" | "default" = "lose";

                    if (winnerClassId && node.classId === winnerClassId) {
                        newStatus = "win";

                        // Advance to the next round slot
                        const nextRound = node.round + 1;
                        const nextPosition = Math.floor(node.position / 2);

                        const nextNodeResult = await db.select().from(tournament_brackets).where(and(
                            eq(tournament_brackets.sportId, sportId),
                            eq(tournament_brackets.round, nextRound),
                            eq(tournament_brackets.position, nextPosition)
                        )).limit(1);

                        if (nextNodeResult.length > 0) {
                            await db.update(tournament_brackets)
                                .set({ classId: winnerClassId, isEliminatedSlot: false })
                                .where(eq(tournament_brackets.id, nextNodeResult[0].id));
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
                    }
                }

                // Kick off the propagation check for the next level
                await propagateBracketProgress(anyNode.round, anyNode.position);
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

            if (!sportId) return fail(400, { message: '종목 ID가 누락되었습니다.' });
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

                for (const m of allPendingMatches) {
                    // Only update if it's round 1 (checked via tournament_brackets)
                    const node = await db.select().from(tournament_brackets).where(eq(tournament_brackets.matchId, m.id)).limit(1);
                    if (node[0]?.round === 1) {
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
            if (!newState || !validStates.includes(newState)) return fail(400, { message: '유효하지 않은 상태입니다.' });

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

            if (!deadline) return fail(400, { message: '마감 기한을 입력해주세요.' });

            const deadlineDate = new Date(deadline);
            if (isNaN(deadlineDate.getTime())) return fail(400, { message: '유효하지 않은 날짜 형식입니다.' });

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
    }
};
