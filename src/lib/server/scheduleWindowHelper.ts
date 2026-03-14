import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { matches, schedules, tournament_brackets, registers } from '$lib/server/db/schema';
import { eq, and, isNull, lt, gt, or, notExists, inArray } from 'drizzle-orm';

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Add N weekdays (Mon–Fri) to a date. Returns a new Date. */
export function addWeekdays(date: Date, count: number): Date {
    const result = new Date(date);
    let added = 0;
    while (added < count) {
        result.setDate(result.getDate() + 1);
        const day = result.getDay();
        if (day !== 0 && day !== 6) added++;
    }
    return result;
}

/** Set time to HH:MM:SS on the given date, returns a new Date. */
function setTime(date: Date, h: number, m: number, s: number): Date {
    const d = new Date(date);
    d.setHours(h, m, s, 0);
    return d;
}

// ─── Schedule Slot Auto-generation ────────────────────────────────────────────

/**
 * Ensure weekday hourly slots exist in the `schedules` table
 * for the given sportId, within [windowStart, windowEnd].
 * 
 * @param fullCleanup If true, scans ALL existing slots for this sport and removes any
 *                    that are misaligned with the current config (and empty).
 */
export async function ensureScheduleSlots(
    sportId: string,
    windowStart: Date,
    windowEnd: Date,
    fullCleanup: boolean = false
): Promise<void> {
    // 0. Fetch sport config for timing
    const sportRecord = await db.select().from(schema.sports).where(eq(schema.sports.id, sportId)).limit(1);
    if (sportRecord.length === 0) return;
    const sport = sportRecord[0];

    // Helper to parse "HH:MM" into hours and minutes
    const parseTime = (timeStr: string | null) => {
        const [h, m] = (timeStr || "10:00").split(':').map(Number);
        return { h: h || 10, m: m || 0 };
    };

    const startConfig = parseTime(sport.dailyStartTime);
    const endConfig = parseTime(sport.dailyEndTime);
    const interval = sport.timeSlotInterval || 60;

    // 1. Generate the set of VALID slots for the provided window
    const validSlotTimesInWindow = new Set<number>();
    const cursor = new Date(windowStart);
    cursor.setHours(0, 0, 0, 0);

    const windowStartTime = windowStart.getTime();
    const windowEndTime = windowEnd.getTime();

    // Also need to know FULL bounds for cleanup
    const fullPeriodStart = sport.periodStart ? new Date(sport.periodStart).getTime() : 0;
    const fullPeriodEnd = sport.periodEnd ? new Date(sport.periodEnd).getTime() : Number.MAX_SAFE_INTEGER;

    while (cursor <= windowEnd) {
        const dow = cursor.getDay();
        if (dow !== 0 && dow !== 6) { // Weekdays
            let slotCursor = setTime(cursor, startConfig.h, startConfig.m, 0);
            const dailyEndLimit = setTime(cursor, endConfig.h, endConfig.m, 0);

            while (slotCursor.getTime() + (interval * 60 * 1000) <= dailyEndLimit.getTime()) {
                const slotTimeMs = slotCursor.getTime();
                if (slotTimeMs >= windowStartTime && slotTimeMs <= windowEndTime) {
                    validSlotTimesInWindow.add(slotTimeMs);
                }
                slotCursor = new Date(slotCursor.getTime() + interval * 60 * 1000);
            }
        }
        cursor.setDate(cursor.getDate() + 1);
    }

    // 2. Fetch existing slots for fast de-dup and potential cleanup
    const existing = await db.select({ id: schedules.id, startTime: schedules.startTime })
        .from(schedules)
        .where(eq(schedules.sportId, sportId));

    const existingTimes = new Set(existing.map(s => s.startTime.getTime()));

    // 3. Insert missing slots
    const toInsert = Array.from(validSlotTimesInWindow)
        .filter(t => !existingTimes.has(t))
        .map(t => ({ sportId, startTime: new Date(t), isAvailable: true }));

    if (toInsert.length > 0) {
        for (let i = 0; i < toInsert.length; i += 50) {
            await db.insert(schedules).values(toInsert.slice(i, i + 50));
        }
    }

    // 4. Advanced Cleanup
    // We want to remove slots that are:
    // a) Outside the sport's full period (if fullCleanup is true)
    // b) Outside the window (only if fully empty, and logically it should have been in (a) anyway)
    // c) Misaligned with dailyStartTime/dailyEndTime or interval
    // d) On a weekend

    // We defines a helper to check if a single timestamp is valid under current config
    const isTimestampValid = (ts: number): boolean => {
        const d = new Date(ts);
        // Weekend check
        if (d.getDay() === 0 || d.getDay() === 6) return false;
        // Global Period check
        if (ts < fullPeriodStart || ts > fullPeriodEnd) return false;

        // Daily hours check
        const dayStart = new Date(d);
        dayStart.setHours(startConfig.h, startConfig.m, 0, 0);
        const dayEnd = new Date(d);
        dayEnd.setHours(endConfig.h, endConfig.m, 0, 0);
        if (ts < dayStart.getTime() || (ts + interval * 60 * 1000) > dayEnd.getTime()) return false;

        // Interval check
        const offsetMs = ts - dayStart.getTime();
        if (offsetMs % (interval * 60 * 1000) !== 0) return false;

        return true;
    };

    const invalidSlotIds: string[] = [];

    for (const slot of existing) {
        const ts = slot.startTime.getTime();

        // If it's a full cleanup, check everything.
        // If not, only check slots WITHIN the current window (to avoid accidentally nuking other rounds)
        const isCurrentlyRelevant = fullCleanup || (ts >= windowStartTime && ts <= windowEndTime);

        if (isCurrentlyRelevant && !isTimestampValid(ts)) {
            invalidSlotIds.push(slot.id);
        }
    }

    if (invalidSlotIds.length > 0) {
        // Delete in smaller chunks to be safe with query param limits
        for (let i = 0; i < invalidSlotIds.length; i += 100) {
            const chunk = invalidSlotIds.slice(i, i + 100);
            await db.delete(schedules)
                .where(and(
                    inArray(schedules.id, chunk),
                    // Must have no registrations
                    notExists(
                        db.select().from(registers).where(eq(registers.scheduleId, schedules.id))
                    ),
                    // Must have no matches assigned
                    notExists(
                        db.select().from(matches).where(eq(matches.scheduleId, schedules.id))
                    )
                ));
        }
    }
}

// ─── Core Window Computation ──────────────────────────────────────────────────

/**
 * Given the match IDs of the TWO feeder matches for a next-round slot,
 * compute the schedule window:
 *   - deadline  = 23:59 of the LATER feeder's scheduledAt
 *   - start     = 3 weekdays after deadline
 *   - end       = start + 5 weekdays
 *
 * Returns null if neither feeder has scheduledAt set.
 */
/**
 * Given the completion times of feeder matches, compute the schedule window:
 *   - deadline  = 23:59:59 of the LATER feeder's completion
 *   - start     = 3 weekdays after deadline (00:00:00)
 *   - end       = start + 5 weekdays (23:59:59) -> Total 6 days selectable
 */
function computeWindowFromEnds(feederEndTimes: Date[])
    : { start: Date; deadline: Date; end: Date } | null {

    if (feederEndTimes.length === 0) return null;

    const laterDate = feederEndTimes.reduce((a, b) => (a > b ? a : b));

    // Deadline is the end of the day AFTER the later date (ensuring a full day buffer)
    const deadline = new Date(laterDate);
    deadline.setDate(deadline.getDate() + 1);
    deadline.setHours(23, 59, 59, 999);

    // Start is 3 weekdays after deadline
    const windowStart = addWeekdays(deadline, 3);
    windowStart.setHours(0, 0, 0, 0);

    // End is 5 weekdays after start (total 6 days inclusive)
    const windowEnd = addWeekdays(windowStart, 5);
    windowEnd.setHours(23, 59, 59, 999);

    return { start: windowStart, deadline, end: windowEnd };
}

/**
 * Recursive helper to find the "completion time" of a bracket branch.
 * - If the node has a scheduled match, its completion time is scheduledAt + duration.
 * - If the node is a "Bye" (only has ONE active feeder in the previous round), 
 *   it inherits that feeder's completion time.
 */
async function getBranchCompletionTime(
    sportId: string,
    round: number,
    position: number,
    durationMs: number
): Promise<Date | "undetermined" | null> {
    const [node] = await db.select()
        .from(tournament_brackets)
        .where(and(
            eq(tournament_brackets.sportId, sportId),
            eq(tournament_brackets.round, round),
            eq(tournament_brackets.position, position)
        )).limit(1);

    if (!node || node.isEliminatedSlot) return null;

    // 1. If match is scheduled, use its end time
    if (node.matchId) {
        const [m] = await db.select({ scheduledAt: matches.scheduledAt }).from(matches).where(eq(matches.id, node.matchId)).limit(1);
        if (m?.scheduledAt) {
            return new Date(m.scheduledAt.getTime() + durationMs);
        }
    }

    // 2. If it's Round 1 and not scheduled, it's undetermined
    if (round === 1) return "undetermined";

    // 3. Round > 1: Check feeders.
    // If it's a "Bye" match (effectively), it might not need scheduling but still has a "completion time".
    const prevRound = round - 1;
    const f1Time = await getBranchCompletionTime(sportId, prevRound, position * 2, durationMs);
    const f2Time = await getBranchCompletionTime(sportId, prevRound, position * 2 + 1, durationMs);

    if (f1Time === "undetermined" || f2Time === "undetermined") return "undetermined";

    // If both null, this branch doesn't exist? (Shouldn't happen for active path)
    if (!f1Time && !f2Time) return null;

    // Return the later of the two (null counts as 0)
    if (!f1Time) return f2Time;
    if (!f2Time) return f1Time;
    return f1Time > f2Time ? f1Time : f2Time;
}

// ─── Main Public Functions ────────────────────────────────────────────────────

/**
 * After a match schedule is set/updated OR result finalized, 
 * compute and apply the schedule window for the next-round match.
 * Recursively propagates to subsequent rounds if they are effectively Byes.
 */
export async function computeOrUpdateNextMatchWindow(triggerMatchId: string): Promise<void> {
    // 1. Fetch sport config
    const matchQueryResult = await db.select({ sportId: matches.sportId }).from(matches).where(eq(matches.id, triggerMatchId)).limit(1);
    if (matchQueryResult.length === 0) return;
    const sportId = matchQueryResult[0].sportId;

    const sportRecord = await db.select().from(schema.sports).where(eq(schema.sports.id, sportId)).limit(1);
    const sport = sportRecord[0];
    if (!sport) return;
    const durationMs = (sport.timeSlotInterval || 60) * 60 * 1000;

    // 2. Find bracket nodes for this match to identify what follows
    const relatedNodes = await db.select()
        .from(tournament_brackets)
        .where(and(
            eq(tournament_brackets.sportId, sportId),
            eq(tournament_brackets.matchId, triggerMatchId)
        ));

    const nextMatchIdsToUpdate = new Set<string>();
    for (const node of relatedNodes) {
        const nextRound = node.round + 1;
        const nextPosition = Math.floor(node.position / 2);

        const [nextNode] = await db.select({ matchId: tournament_brackets.matchId })
            .from(tournament_brackets)
            .where(and(
                eq(tournament_brackets.sportId, sportId),
                eq(tournament_brackets.round, nextRound),
                eq(tournament_brackets.position, nextPosition)
            )).limit(1);

        if (nextNode?.matchId) nextMatchIdsToUpdate.add(nextNode.matchId);
    }

    for (const nextMatchId of nextMatchIdsToUpdate) {
        const targetNodes = await db.select({ position: tournament_brackets.position, round: tournament_brackets.round })
            .from(tournament_brackets)
            .where(eq(tournament_brackets.matchId, nextMatchId));

        if (targetNodes.length === 0) continue;
        const round = targetNodes[0].round;
        const prevRound = round - 1;

        const feederEndTimes: Date[] = [];
        let canCompute = true;

        for (const node of targetNodes) {
            const compTime = await getBranchCompletionTime(sportId, prevRound, node.position * 2, durationMs);
            if (compTime === "undetermined") {
                canCompute = false; break;
            }
            if (compTime) feederEndTimes.push(compTime);

            const compTime2 = await getBranchCompletionTime(sportId, prevRound, node.position * 2 + 1, durationMs);
            if (compTime2 === "undetermined") {
                canCompute = false; break;
            }
            if (compTime2) feederEndTimes.push(compTime2);
        }

        if (canCompute && feederEndTimes.length > 0) {
            const window = computeWindowFromEnds(feederEndTimes);
            if (window) {
                await db.update(matches).set({
                    scheduleWindowStart: window.start,
                    scheduleWindowEnd: window.end,
                    scheduleWindowDeadline: window.deadline
                }).where(eq(matches.id, nextMatchId));

                await ensureScheduleSlots(sportId, window.start, window.end);

                // RECURSION: This match now potentially has a completion time (if it's a bye)
                // or just had its window set. Actually, recursion is needed if we want to 
                // ripple THROUGH matches that don't need scheduling (Byes).
                await computeOrUpdateNextMatchWindowForMatch(nextMatchId, sportId, durationMs);
            }
        } else {
            await db.update(matches).set({
                scheduleWindowStart: null, scheduleWindowEnd: null, scheduleWindowDeadline: null
            }).where(eq(matches.id, nextMatchId));
        }
    }
}

/** Internal version to avoid re-fetching sport info */
async function computeOrUpdateNextMatchWindowForMatch(matchId: string, sportId: string, durationMs: number): Promise<void> {
    // Similar to above but uses the pre-fetched info
    const relatedNodes = await db.select()
        .from(tournament_brackets)
        .where(and(
            eq(tournament_brackets.sportId, sportId),
            eq(tournament_brackets.matchId, matchId)
        ));

    const nextMatchIdsToUpdate = new Set<string>();
    for (const node of relatedNodes) {
        const nextRound = node.round + 1;
        const nextPosition = Math.floor(node.position / 2);
        const [nextNode] = await db.select({ matchId: tournament_brackets.matchId }).from(tournament_brackets)
            .where(and(eq(tournament_brackets.sportId, sportId), eq(tournament_brackets.round, nextRound), eq(tournament_brackets.position, nextPosition))).limit(1);
        if (nextNode?.matchId) nextMatchIdsToUpdate.add(nextNode.matchId);
    }

    for (const nextMatchId of nextMatchIdsToUpdate) {
        const targetNodes = await db.select({ position: tournament_brackets.position, round: tournament_brackets.round }).from(tournament_brackets).where(eq(tournament_brackets.matchId, nextMatchId));
        if (targetNodes.length === 0) continue;
        const prevRound = targetNodes[0].round - 1;
        const feederEndTimes: Date[] = [];
        let canCompute = true;
        for (const node of targetNodes) {
            const c1 = await getBranchCompletionTime(sportId, prevRound, node.position * 2, durationMs);
            if (c1 === "undetermined") { canCompute = false; break; }
            if (c1) feederEndTimes.push(c1);
            const c2 = await getBranchCompletionTime(sportId, prevRound, node.position * 2 + 1, durationMs);
            if (c2 === "undetermined") { canCompute = false; break; }
            if (c2) feederEndTimes.push(c2);
        }

        if (canCompute && feederEndTimes.length > 0) {
            const window = computeWindowFromEnds(feederEndTimes);
            if (window) {
                await db.update(matches).set({ scheduleWindowStart: window.start, scheduleWindowEnd: window.end, scheduleWindowDeadline: window.deadline }).where(eq(matches.id, nextMatchId));
                await ensureScheduleSlots(sportId, window.start, window.end);
                await computeOrUpdateNextMatchWindowForMatch(nextMatchId, sportId, durationMs);
            }
        }
    }
}

/**
 * For a bye-won match, propagate the schedule window upward recursively.
 * Used when processByeMatches auto-advances a team without a real match.
 *
 * @param byeMatchId The match that was processed as a bye
 */
export async function propagateByeWindow(byeMatchId: string): Promise<void> {
    // 1. Find the bracket node for this bye match
    const bracketNode = await db.select().from(tournament_brackets).where(eq(tournament_brackets.matchId, byeMatchId)).limit(1);
    if (!bracketNode[0]) return;

    const { sportId, round, position } = bracketNode[0];
    let candidateScheduledAt = new Date();

    // 2. If it's Round > 1, find predecessors to determine the date
    if (round > 1) {
        const prevRound = round - 1;
        const pos1 = position * 2;
        const pos2 = position * 2 + 1;

        const feeders = await db.select({ matchId: tournament_brackets.matchId })
            .from(tournament_brackets)
            .where(and(
                eq(tournament_brackets.sportId, sportId),
                eq(tournament_brackets.round, prevRound),
                or(eq(tournament_brackets.position, pos1), eq(tournament_brackets.position, pos2))
            ));

        const feederMatchIds = feeders.map(f => f.matchId).filter((id): id is string => !!id);

        if (feederMatchIds.length > 0) {
            const feederMatches = await db.select({ scheduledAt: matches.scheduledAt })
                .from(matches)
                .where(inArray(matches.id, feederMatchIds));
            
            const validDates = feederMatches.map(m => m.scheduledAt).filter((d): d is Date => !!d);
            
            if (validDates.length > 0) {
                const laterDate = new Date(Math.max(...validDates.map(d => d.getTime())));
                candidateScheduledAt = new Date(laterDate);
                candidateScheduledAt.setDate(candidateScheduledAt.getDate() + 1);
            }
        }
    }

    // 3. Update the match's scheduledAt if not already set
    const byeMatch = await db.select().from(matches).where(eq(matches.id, byeMatchId)).limit(1);
    if (!byeMatch[0]?.scheduledAt) {
        await db.update(matches).set({ scheduledAt: candidateScheduledAt }).where(eq(matches.id, byeMatchId));
    }

    // Then run normal window computation
    await computeOrUpdateNextMatchWindow(byeMatchId);

    // Check if the next match is ALSO a bye (opponent was also a bye-winner)
    const winNode = (await db.select().from(tournament_brackets).where(
        and(eq(tournament_brackets.matchId, byeMatchId), eq(tournament_brackets.status, 'win'))
    ))[0];
    if (!winNode) return;

    const nextRound = winNode.round + 1;
    const nextPosition = Math.floor(winNode.position / 2);
    const allNodes = await db.select().from(tournament_brackets).where(
        eq(tournament_brackets.sportId, winNode.sportId)
    );

    const nextNode = allNodes.find(n => n.round === nextRound && n.position === nextPosition);
    if (!nextNode?.matchId) return;

    const nextMatch = await db.select().from(matches).where(eq(matches.id, nextNode.matchId)).limit(1);
    if (nextMatch[0]?.isVerified) {
        // Next match also already verified (another bye) → recurse
        await propagateByeWindow(nextNode.matchId);
    }
}
