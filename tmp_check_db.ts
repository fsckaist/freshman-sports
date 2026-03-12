import { db } from './src/lib/server/db';
import { sports, schedules } from './src/lib/server/db/schema';

async function check() {
    const allSports = await db.select().from(sports);
    console.log('Sports:', allSports.map(s => ({ id: s.id, name: s.name, start: s.periodStart, end: s.periodEnd })));

    const allSchedules = await db.select().from(schedules);
    console.log('Total Schedules:', allSchedules.length);

    process.exit(0);
}

check();
