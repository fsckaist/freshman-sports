import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const handle: Handle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get('session');

    if (sessionId) {
        try {
            const fetchedUsers = await db.select().from(users).where(eq(users.id, sessionId)).limit(1);
            if (fetchedUsers.length > 0) {
                event.locals.user = fetchedUsers[0];
            }
        } catch (e) {
            console.error('Error fetching user for session:', e);
        }
    }

    const { pathname } = event.url;
    const user = event.locals.user;

    if (!user) {
        if (!pathname.startsWith('/login') && !pathname.startsWith('/register')) {
            throw redirect(303, '/login');
        }
    }
    else {
        const needsRules = !user.agreedRules;
        const needsPolicy = !user.agreedPrivacy;

        if (needsRules) {
            if (pathname !== '/register/rules' && pathname !== '/info/rules') {
                throw redirect(303, '/register/rules');
            }
        } else if (needsPolicy) {
            if (pathname !== '/register/privacy' && pathname !== '/info/privacy') {
                throw redirect(303, '/register/privacy');
            }
        }
        else {
            if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/info') || pathname === '/') {
                if (pathname !== '/') {
                    throw redirect(303, '/');
                }
            }
        }
    }

    return resolve(event);
};