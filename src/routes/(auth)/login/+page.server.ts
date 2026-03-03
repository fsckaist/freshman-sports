import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions } from './$types';

export const actions = {
    login: async (event) => {
        const data = await event.request.formData();
        const student_number = data.get('student_number');

        if (!student_number || typeof student_number !== 'string' || student_number.trim().length === 0) {
            return fail(400, { error: '학번을 입력해주세요.' });
        }

        try {
            // Verify user exists in the database using Drizzle ORM
            const existingUsers = await db.select()
                .from(users)
                .where(eq(users.studentNumber, student_number.trim()))
                .limit(1);

            if (existingUsers.length === 0) {
                // If user doesn't exist, we reject the login (registration should be separate or seeded)
                return fail(404, { error: '등록되지 않은 학번입니다. 관리자에게 문의하세요.' });
            }

            const user = existingUsers[0];

            // In a fully secure app, you would generate a cryptographically secure session ID,
            // store it in a `sessions` table linked to the user, and set the cookie.
            // For this implementation, we use a simplified approach of storing the UUID directly
            // or setting the student number as the session cookie.

            // Set the global session cookie. Secure flag in prod.
            event.cookies.set('session', user.id, {
                path: '/',
                httpOnly: true,
                secure: !dev,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });

            // Conditional Redirect based on user agreements
            if (user.agreedPrivacy && user.agreedRules) {
                throw redirect(303, '/dashboard');
            } else {
                throw redirect(303, '/register/rules');
            }
        } catch (e) {
            // We catch everything including redirect. Rethrow redirect exceptions so SvelteKit can handle them!
            if (e && typeof e === 'object' && 'status' in e && 'location' in e) {
                throw e; // Bubble up SvelteKit Redirect
            }
            console.error('Login Database Error:', e);
            return fail(500, { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
        }
    },
    logout: async (event) => {
        event.cookies.delete('session', { path: '/' });
        throw redirect(303, '/login');
    }
} satisfies Actions;
