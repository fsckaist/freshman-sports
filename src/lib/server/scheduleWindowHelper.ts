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

            while (slotCursor <= dailyEndLimit) {
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
        if (ts < dayStart.getTime() || ts > dayEnd.getTime()) return false;

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
function computeWindow(feeder1ScheduledAt: Date | null, feeder2ScheduledAt: Date | null)
    : { start: Date; deadline: Date; end: Date } | null {

    const valid = [feeder1ScheduledAt, feeder2ScheduledAt].filter(Boolean) as Date[];
    if (valid.length === 0) return null;

    const laterDate = valid.reduce((a, b) => (a > b ? a : b));
    const deadline = setTime(laterDate, 23, 59, 0);
    const windowStart = addWeekdays(deadline, 3);
    windowStart.setHours(0, 0, 0, 0);
    const windowEnd = addWeekdays(windowStart, 5);
    windowEnd.setHours(23, 59, 0, 0);

    return { start: windowStart, deadline, end: windowEnd };
}

// ─── Main Public Functions ────────────────────────────────────────────────────

/**
 * After a match result is finalized, compute and apply the schedule window
 * for the next-round match, then auto-generate schedule slots.
 *
 * @param finishedMatchId The match whose result was just confirmed
 */
export async function computeOrUpdateNextMatchWindow(finishedMatchId: string): Promise<void> {
    // 1. Find the bracket node(s) for the winner in this match (status = 'win')
    const winnerNodes = await db.select()
        .from(tournament_brackets)
        .where(and(
            eq(tournament_brackets.matchId, finishedMatchId),
            eq(tournament_brackets.status, 'win')
        ));

    for (const winNode of winnerNodes) {
        // 2. Find the next-round bracket node for this winner
        const nextRound = winNode.round + 1;
        const nextPosition = Math.floor(winNode.position / 2);

        const nextNodes = await db.select()
            .from(tournament_brackets)
            .where(and(
                eq(tournament_brackets.sportId, winNode.sportId),
                eq(tournament_brackets.round, nextRound),
            ));

        const nextNode = nextNodes.find(n => n.position === nextPosition);
        if (!nextNode || !nextNode.matchId) continue;

        // 3. Find BOTH feeder nodes for the next match (same parent match)
        //    They are at round R-1, position 2*nextPosition and 2*nextPosition+1
        const feederNodes = await db.select()
            .from(tournament_brackets)
            .where(and(
                eq(tournament_brackets.sportId, winNode.sportId),
            ));

        const feeder1 = feederNodes.find(
            n => n.round === winNode.round && n.position === nextPosition * 2
        );
        const feeder2 = feederNodes.find(
            n => n.round === winNode.round && n.position === nextPosition * 2 + 1
        );

        // 4. Get scheduledAt of both feeder matches
        let f1ScheduledAt: Date | null = null;
        let f2ScheduledAt: Date | null = null;

        if (feeder1?.matchId) {
            const m = await db.select({ scheduledAt: matches.scheduledAt }).from(matches).where(eq(matches.id, feeder1.matchId)).limit(1);
            f1ScheduledAt = m[0]?.scheduledAt ?? null;
        }
        if (feeder2?.matchId) {
            const m = await db.select({ scheduledAt: matches.scheduledAt }).from(matches).where(eq(matches.id, feeder2.matchId)).limit(1);
            f2ScheduledAt = m[0]?.scheduledAt ?? null;
        }

        const window = computeWindow(f1ScheduledAt, f2ScheduledAt);
        if (!window) continue;

        // 5. Update the next match with the window
        await db.update(matches).set({
            scheduleWindowStart: window.start,
            scheduleWindowEnd: window.end,
            scheduleWindowDeadline: window.deadline
        }).where(eq(matches.id, nextNode.matchId));

        // 6. Auto-generate schedule slots in the window
        await ensureScheduleSlots(winNode.sportId, window.start, window.end);
    }
}

/**
 * For a bye-won match, propagate the schedule window upward recursively.
 * Used when processByeMatches auto-advances a team without a real match.
 *
 * @param byeMatchId The match that was processed as a bye
 */
export async function propagateByeWindow(byeMatchId: string): Promise<void> {
    // A bye match doesn't have a real scheduledAt — use "now" as the proxy
    // so the next round can compute its window immediately
    const byeMatch = await db.select().from(matches).where(eq(matches.id, byeMatchId)).limit(1);
    if (!byeMatch[0]?.scheduledAt) {
        // Set scheduledAt to now so the window can be computed
        await db.update(matches).set({ scheduledAt: new Date() }).where(eq(matches.id, byeMatchId));
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
