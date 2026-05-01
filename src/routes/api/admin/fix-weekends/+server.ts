import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { matches } from '$lib/server/db/schema';
import { eq, isNotNull } from 'drizzle-orm';
import { addWeekdays, ensureScheduleSlots } from '$lib/server/scheduleWindowHelper';

export async function GET({ locals }) {
    // Check if the user is an admin (assuming there is an admin role check in locals)
    if (locals.user?.role !== 'admin') {
        return json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    let windowFixedCount = 0;
    let scheduledFixedCount = 0;

    try {
        // 1. Fix scheduleWindowDeadline
        const allMatches = await db.select().from(matches).where(isNotNull(matches.scheduleWindowDeadline));
        
        for (const match of allMatches) {
            if (!match.scheduleWindowDeadline) continue;
            
            const deadline = new Date(match.scheduleWindowDeadline);
            const day = deadline.getDay();

            if (day === 0 || day === 6) {
                if (day === 6) {
                    deadline.setDate(deadline.getDate() + 2);
                } else if (day === 0) {
                    deadline.setDate(deadline.getDate() + 1);
                }

                const windowStart = addWeekdays(deadline, 4);
                windowStart.setHours(0, 0, 0, 0);

                const windowEnd = addWeekdays(windowStart, 4);
                windowEnd.setHours(23, 59, 59, 999);

                await db.update(matches).set({
                    scheduleWindowDeadline: deadline,
                    scheduleWindowStart: windowStart,
                    scheduleWindowEnd: windowEnd
                }).where(eq(matches.id, match.id));

                await ensureScheduleSlots(match.sportId, windowStart, windowEnd);
                windowFixedCount++;
            }
        }

        // 2. Fix scheduledAt
        const scheduledMatches = await db.select().from(matches).where(isNotNull(matches.scheduledAt));

        for (const match of scheduledMatches) {
            if (!match.scheduledAt) continue;
            
            const scheduledAt = new Date(match.scheduledAt);
            const day = scheduledAt.getDay();

            if (day === 0 || day === 6) {
                if (day === 6) {
                    scheduledAt.setDate(scheduledAt.getDate() + 2);
                } else if (day === 0) {
                    scheduledAt.setDate(scheduledAt.getDate() + 1);
                }

                await db.update(matches).set({
                    scheduledAt: scheduledAt
                }).where(eq(matches.id, match.id));
                scheduledFixedCount++;
            }
        }

        return json({
            success: true,
            message: `Successfully fixed schedules.`,
            details: {
                windowFixedCount,
                scheduledFixedCount
            }
        });
    } catch (error) {
        console.error('Error fixing weekend schedules:', error);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
