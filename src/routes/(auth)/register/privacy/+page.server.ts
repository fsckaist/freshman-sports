import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { invalidateUserCache } from '../../../../hooks.server';

export const load: PageServerLoad = async (event) => {
    // Require authentication to hit the registration flow
    if (!event.locals.user) {
        throw redirect(303, '/login');
    }
    return {
        user: event.locals.user
    };
};

export const actions = {
    agree: async (event) => {
        if (!event.locals.user || !event.locals.user.id) {
            return fail(401, { error: 'Unauthorized' });
        }

        try {
            await db.update(users)
                .set({
                    agreedPrivacy: true
                })
                .where(eq(users.id, event.locals.user.id));
        } catch (e) {
            console.error('Failed to update user agreements:', e);
            return fail(500, { error: 'Failed to save agreement. Please try again.' });
        }

        invalidateUserCache(event.locals.user.id);

        // Redirect to the Dashboard to finalize the Registration flow
        throw redirect(303, '/');
    }
} satisfies Actions;
