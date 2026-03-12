import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { system_config, type EventState } from '$lib/server/db/schema';

export const load = (async ({ locals }) => {
    // Fetch or create the system config row
    let configs = await db.select().from(system_config).limit(1);
    if (configs.length === 0) {
        const inserted = await db.insert(system_config).values({}).returning();
        configs = inserted;
    }
    const eventState = configs[0].eventState as EventState;


    return {
        user: locals.user,
        eventState
    };
}) satisfies LayoutServerLoad;
