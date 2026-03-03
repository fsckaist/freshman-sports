import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sports, schedules, registers, users, rosters } from '$lib/server/db/schema';
import { eq, and, asc, gte, lte } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
    try {
        const user = locals.user;
        if (!user) {
            throw redirect(302, '/login');
        }

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

        // 2. Fetch Schedule Slots with a Left Join to Registers & Users
        // Date handling
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const day5 = new Date(tomorrow);
        day5.setDate(day5.getDate() + 4); // +4 because tomorrow is day 1
        day5.setHours(23, 59, 59, 999);

        const rawData = await db.select({
            schedule: schedules,
            register: registers,
            user: users
        })
            .from(schedules)
            .leftJoin(
                registers,
                and(
                    eq(schedules.id, registers.scheduleId),
                    eq(registers.isAvailable, true) // Only join active registrations
                )
            )
            .leftJoin(users, eq(registers.userId, users.id))
            .where(
                and(
                    eq(schedules.sportId, activeSport.id),
                    gte(schedules.startTime, tomorrow),
                    lte(schedules.startTime, day5)
                )
            )
            .orderBy(asc(schedules.startTime));

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

        // 4. Mock Deadline Logic
        const deadlineDate = new Date("2026-04-02T23:59:00+09:00");
        const today = new Date();
        const difMs = deadlineDate.getTime() - today.getTime();
        const hoursRemaining = Math.max(0, Math.floor(difMs / (1000 * 60 * 60)));

        // Return sports as {id, name}[] so frontend can use anchor tags for "?sportId=" routing
        const sportTabs = allSports.map(s => ({
            id: s.id,
            name: s.name
        }));

        return {
            deadlineDate: "04월 02일",
            hoursRemaining,
            sports: sportTabs,
            activeSportId: activeSport.id,
            gridData: formattedGrid,
            currentUserClassId: user.classId,
            isEligible,
            minPlayers: activeSport.minPlayers
        };
    } catch (e) {
        // Redirection should be thrown immediately, not caught as an error.
        // SvelteKit uses thrown Response objects to manage redirects.
        if (e && typeof e === 'object' && 'status' in e && e.status === 302) {
            throw e;
        }

        console.error("Loader Error in Schedule (+page.server.ts):", e);
        // Providing safe fallback
        return {
            deadlineDate: "N/A",
            hoursRemaining: 0,
            sports: [],
            activeSportId: null,
            schedules: []
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
            const deadlineDate = new Date("2026-04-02T23:59:00+09:00");
            const today = new Date();
            if (today > deadlineDate) {
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
