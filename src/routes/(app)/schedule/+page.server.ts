import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sports, schedules, registers, users, rosters, matches, system_config, tournament_brackets } from '$lib/server/db/schema';
import { eq, and, or, asc, gte, lte } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
    try {
        const user = locals.user;
        if (!user) throw redirect(302, '/login');

        // State guard: schedule page only visible during ONGOING
        const configs = await db.select().from(system_config).limit(1);
        const eventState = configs[0]?.eventState ?? 'REGISTRATION';
        if (eventState !== 'ONGOING') throw redirect(302, '/dashboard');

        // 1. URL Parameter Handling
        let requestedSportId = url.searchParams.get('sportId');

        // Fetch all sports for the tab navigation
        const allSports = await db.select().from(sports).orderBy(asc(sports.displayOrder));

        if (allSports.length === 0) {
            return {
                deadlineDate: "N/A",
                hoursRemaining: 0,
                sports: [],
                activeSportId: null,
                schedules: []
            };
        }

        // Default to first sport if not provided or invalid
        let activeSport = allSports.find(s => s.id === requestedSportId);
        if (!activeSport) {
            activeSport = allSports[0];
            requestedSportId = activeSport.id;
        }

        // Roster Validation Check
        const rosterCheck = await db.select()
            .from(rosters)
            .where(
                and(
                    eq(rosters.userId, user.id),
                    eq(rosters.sportId, activeSport.id)
                )
            )
            .limit(1);

        const isEligible = rosterCheck.length > 0;

        // Pending Match + window fields
        let hasPendingMatch = false;
        let pendingMatchData: {
            id: string;
            scheduleWindowStart: Date | null;
            scheduleWindowEnd: Date | null;
            scheduleWindowDeadline: Date | null;
            round: number;
        } | null = null;
        if (user.classId) {
            const pendingMatchCheck = await db.select({
                id: matches.id,
                scheduleWindowStart: matches.scheduleWindowStart,
                scheduleWindowEnd: matches.scheduleWindowEnd,
                scheduleWindowDeadline: matches.scheduleWindowDeadline,
                round: tournament_brackets.round
            })
                .from(matches)
                .innerJoin(tournament_brackets, eq(matches.id, tournament_brackets.matchId))
                .where(
                    and(
                        eq(matches.sportId, activeSport.id),
                        eq(matches.status, 'PENDING_SCHEDULE'),
                        or(
                            eq(matches.classAId, user.classId),
                            eq(matches.classBId, user.classId)
                        )
                    )
                )
                .limit(1);
            if (pendingMatchCheck.length > 0) {
                hasPendingMatch = true;
                pendingMatchData = pendingMatchCheck[0];
            }
        }

        // 2. Determine grid date range from the match window
        const now = new Date();

        // If match has a window, use it; otherwise fall back to system_config round-1 config
        let startDate: Date | null = null;
        let endDate: Date | null = null;
        let deadlineDate: Date | null = null;

        const isRound1 = pendingMatchData?.round === 1;

        if (!isRound1 && pendingMatchData?.scheduleWindowStart && (pendingMatchData?.scheduleWindowEnd || pendingMatchData?.scheduleWindowDeadline)) {
            startDate = new Date(pendingMatchData.scheduleWindowStart);
            endDate = new Date(pendingMatchData.scheduleWindowEnd ?? pendingMatchData.scheduleWindowDeadline!);
            endDate.setHours(23, 59, 59, 999);
            deadlineDate = new Date(pendingMatchData.scheduleWindowDeadline!);
        } else if (activeSport.round1SelectionStart && activeSport.round1SelectionEnd && activeSport.round1Deadline) {
            startDate = new Date(activeSport.round1SelectionStart);
            endDate = new Date(activeSport.round1SelectionEnd);
            endDate.setHours(23, 59, 59, 999);
            deadlineDate = new Date(activeSport.round1Deadline);
        }

        let deadlineAt: string | null = null;
        let hoursRemaining = 0;
        let deadlinePassed = false;
        let deadlineLabel = "N/A";

        if (deadlineDate) {
            deadlinePassed = now > deadlineDate;
            const dlMonth = String(deadlineDate.getMonth() + 1).padStart(2, '0');
            const dlDay = String(deadlineDate.getDate()).padStart(2, '0');
            const dlHour = String(deadlineDate.getHours()).padStart(2, '0');
            const dlMin = String(deadlineDate.getMinutes()).padStart(2, '0');

            deadlineLabel = `${dlMonth}월 ${dlDay}일`;
            deadlineAt = `${deadlineLabel} ${dlHour}:${dlMin}`;

            const difMs = deadlineDate.getTime() - now.getTime();
            hoursRemaining = Math.max(0, Math.floor(difMs / (1000 * 60 * 60)));
        }

        const rawData = (startDate && endDate) ? await db.select({
            schedule: schedules,
            register: registers,
            user: users
        })
            .from(schedules)
            .leftJoin(
                registers,
                and(
                    eq(schedules.id, registers.scheduleId),
                    eq(registers.isAvailable, true)
                )
            )
            .leftJoin(users, eq(registers.userId, users.id))
            .where(
                and(
                    eq(schedules.sportId, activeSport.id),
                    gte(schedules.startTime, startDate),
                    lte(schedules.startTime, endDate)
                )
            )
            .orderBy(asc(schedules.startTime)) : [];

        // 3. Map Flat Result into Grouped Payload
        // Structure: Map<DateString (YYYY-MM-DD), Array<ScheduleSlot>>

        type Participant = { name: string; userId: string; classId: string | null };
        type ScheduleSlot = {
            id: string;
            startTime: string;
            isSlotAvailable: boolean;
            registrations: Participant[];
            totalVotes: number;
            isVoted: boolean;
        };

        const gridMap = new Map<string, Map<string, ScheduleSlot>>();

        for (const row of rawData) {
            const dateObj = row.schedule.startTime;

            // Skip weekends explicitly (0 = Sunday, 6 = Saturday)
            const dayOfWeek = dateObj.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) continue;

            // Format YYYY-MM-DD reliably
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            const dateKey = `${yyyy}-${mm}-${dd}`;

            if (!gridMap.has(dateKey)) {
                gridMap.set(dateKey, new Map());
            }

            const daySlots = gridMap.get(dateKey)!;
            const schedId = row.schedule.id;

            if (!daySlots.has(schedId)) {
                daySlots.set(schedId, {
                    id: schedId,
                    startTime: dateObj.toISOString(),
                    isSlotAvailable: row.schedule.isAvailable ?? true,
                    registrations: [],
                    totalVotes: 0,
                    isVoted: false
                });
            }

            const mappedSlot = daySlots.get(schedId)!;

            if (row.register && row.user) {
                mappedSlot.registrations.push({
                    name: row.user.name ?? "익명",
                    userId: row.user.id,
                    classId: row.user.classId
                });
                mappedSlot.totalVotes++;
                if (row.user.id === user.id) {
                    mappedSlot.isVoted = true;
                }
            }
        }

        // Convert Map of Maps to a structured primitive object for Svelte serialization
        const formattedGrid: Record<string, ScheduleSlot[]> = {};
        for (const [dateKey, mapSlots] of gridMap.entries()) {
            formattedGrid[dateKey] = Array.from(mapSlots.values());
        }


        // Return sports as {id, name}[] so frontend can use anchor tags for "?sportId=" routing
        const sportTabs = allSports.map(s => ({
            id: s.id,
            name: s.name
        }));

        return {
            deadlineDate: deadlineLabel,
            deadlineAt,
            hoursRemaining,
            deadlinePassed,
            sports: sportTabs,
            activeSportId: activeSport.id,
            gridData: deadlinePassed ? {} : formattedGrid,
            currentUserClassId: user.classId,
            isEligible,
            hasPendingMatch,
            minPlayers: activeSport.minPlayers
        };
    } catch (e) {
        // Redirection should be thrown immediately, not caught as an error.
        // SvelteKit uses thrown Response objects to manage redirects.
        if (e && typeof e === 'object' && 'status' in e && e.status === 302) {
            throw e;
        }

        console.error("Loader Error in Schedule (+page.server.ts):", e);
        return {
            deadlineDate: "N/A",
            deadlineAt: "N/A",
            hoursRemaining: 0,
            deadlinePassed: false,
            sports: [],
            activeSportId: null,
            gridData: {},
            currentUserClassId: null,
            isEligible: false,
            hasPendingMatch: false,
            minPlayers: 0
        };
    }
};

export const actions: Actions = {
    toggleVote: async ({ request, locals }) => {
        try {
            const user = locals.user;

            // Check authentication explicitly
            if (!user) {
                return fail(401, { message: "로그인이 필요합니다." });
            }
            if (!user.classId) {
                return fail(403, { message: "소속된 반(Class) 정보가 없어 투표할 수 없습니다." });
            }

            const formData = await request.formData();
            const slotId = formData.get('slotId')?.toString();

            if (!slotId) {
                return fail(400, { message: "슬롯 아이디가 누락되었습니다." });
            }

            // 1. Deadline Validation
            // Fetch the sport/match info to get the specific deadline
            const currentSchedule = await db.select().from(schedules).where(eq(schedules.id, slotId)).limit(1);
            if (currentSchedule.length === 0) return fail(404, { message: "일정을 찾을 수 없습니다." });

            const sport = await db.select().from(sports).where(eq(sports.id, currentSchedule[0].sportId)).limit(1);
            if (sport.length === 0) return fail(404, { message: "종목 정보를 찾을 수 없습니다." });

            const matchCheck = await db.select({
                deadline: matches.scheduleWindowDeadline,
                round: tournament_brackets.round
            })
                .from(matches)
                .innerJoin(tournament_brackets, eq(matches.id, tournament_brackets.matchId))
                .where(and(
                    eq(matches.sportId, sport[0].id),
                    eq(matches.status, 'PENDING_SCHEDULE'),
                    or(eq(matches.classAId, user.classId), eq(matches.classBId, user.classId))
                ))
                .limit(1);

            let activeDeadline = sport[0].round1Deadline;
            if (matchCheck.length > 0 && matchCheck[0].round !== 1 && matchCheck[0].deadline) {
                activeDeadline = matchCheck[0].deadline;
            }

            const today = new Date();
            if (activeDeadline && today > activeDeadline) {
                return fail(403, { message: "투표가 마감되었습니다." });
            }

            // 2. Schedule Existence Check
            const scheduleRecord = await db.select().from(schedules).where(eq(schedules.id, slotId)).limit(1);
            if (scheduleRecord.length === 0) {
                return fail(404, { message: "존재하지 않는 일정입니다." });
            }

            const targetSchedule = scheduleRecord[0];

            // 3. Roster Check (Security)
            const isRostered = await db.select().from(rosters)
                .where(
                    and(
                        eq(rosters.userId, user.id),
                        eq(rosters.sportId, targetSchedule.sportId)
                    )
                )
                .limit(1);

            if (isRostered.length === 0) {
                return fail(403, { message: "해당 종목의 출전 선수가 아니므로 일정을 선택할 수 없습니다." });
            }

            // 3.5. Pending Match Check (Security)
            const pendingMatchCheck = await db.select()
                .from(matches)
                .where(
                    and(
                        eq(matches.sportId, targetSchedule.sportId),
                        eq(matches.status, 'PENDING_SCHEDULE'),
                        or(
                            eq(matches.classAId, user.classId),
                            eq(matches.classBId, user.classId)
                        )
                    )
                )
                .limit(1);

            if (pendingMatchCheck.length === 0) {
                return fail(403, { message: "일정을 조율할 예정된 경기가 없습니다." });
            }

            // 4. Toggle Logic 
            const existingVote = await db.select()
                .from(registers)
                .where(
                    and(
                        eq(registers.scheduleId, slotId),
                        eq(registers.userId, user.id)
                    )
                )
                .limit(1);

            if (existingVote.length > 0) {
                const vote = existingVote[0];
                await db.delete(registers).where(eq(registers.id, vote.id));
            } else {
                // Ensure classId is passed explicitly per schema constraint
                await db.insert(registers).values({
                    classId: user.classId,
                    userId: user.id,
                    scheduleId: slotId,
                    isAvailable: true
                });
            }

            return { success: true };

        } catch (e) {
            console.error("Action Error (toggleVote) in Schedule:", e);
            return fail(500, { message: "서버 처리 중 오류가 발생했습니다." });
        }
    }
};
