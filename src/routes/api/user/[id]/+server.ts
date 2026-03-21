import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
    // Basic auth check
    const authUser = locals.user;
    if (!authUser || (!authUser.isManager && !authUser.isAdmin)) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
        return json({ error: 'Missing user id' }, { status: 400 });
    }

    // Validate UUID format roughly
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        return json({ error: 'Invalid user id format' }, { status: 400 });
    }

    try {
        const result = await db.select({
            id: users.id,
            name: users.name,
            studentNumber: users.studentNumber,
            classId: users.classId
        })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

        if (result.length === 0) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        return json(result[0]);
    } catch (e) {
        console.error("Error fetching user for QR:", e);
        return json({ error: 'Server error' }, { status: 500 });
    }
};
