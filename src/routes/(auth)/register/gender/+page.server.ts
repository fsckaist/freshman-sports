import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

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
    setGender: async (event) => {
        if (!event.locals.user) {
            return fail(401, { error: 'Unauthorized' });
        }

        const formData = await event.request.formData();
        const genderStr = formData.get('gender')?.toString();

        if (genderStr !== 'MALE' && genderStr !== 'FEMALE') {
            return fail(400, { error: 'Invalid gender selection.' });
        }

        try {
            await db.update(users)
                .set({
                    gender: genderStr
                })
                .where(eq(users.id, event.locals.user.id));
        } catch (e) {
            console.error('Failed to update user gender:', e);
            return fail(500, { error: 'Failed to save gender. Please try again.' });
        }

        if (event.locals.user.agreedRules) {
            if (event.locals.user.agreedPrivacy) {
                throw redirect(303, '/');
            } else {
                throw redirect(303, '/register/privacy');
            }
        }
        throw redirect(303, '/register/rules');
    }
} satisfies Actions;
