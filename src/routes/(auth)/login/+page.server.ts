import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { signToken } from '$lib/server/jwt';

export const load: PageServerLoad = async () => {
    return {
        useSparcsSso: env.USE_SPARCS_SSO !== 'false'
    };
};

export const actions = {
    login: async ({ request, cookies }) => {
        const useSparcsSso = env.USE_SPARCS_SSO !== 'false';
        if (useSparcsSso) {
            throw redirect(303, '/auth/sso/login');
        }

        const data = await request.formData();
        const studentNumber = data.get('studentNumber')?.toString();

        if (!studentNumber || studentNumber.trim().length === 0) {
            return fail(400, { error: JSON.stringify({ ko: '학번을 입력해주세요.', en: 'Please enter your student ID.' }) });
        }

        const num = studentNumber.trim();
        const existingUsers = await db.select().from(users).where(eq(users.studentNumber, num)).limit(1);

        let dbUser = existingUsers[0];

        if (!dbUser) {
            return fail(400, { error: JSON.stringify({ 
                ko: `${num}는 등록되지 않은 학번이에요.`, 
                en: `${num} is not a registered student ID.` 
            }) });
        }

        const token = signToken({
            studentNumber: dbUser.studentNumber,
            dbUserId: dbUser.id,
        });

        cookies.set('session', token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        if (!dbUser.gender) {
            throw redirect(303, '/register/gender');
        } else if (dbUser.agreedPrivacy && dbUser.agreedRules) {
            throw redirect(303, '/');
        } else {
            throw redirect(303, '/register/rules');
        }
    },
    logout: async (event) => {
        event.cookies.delete('session', { path: '/' });
        event.cookies.delete('admin_session', { path: '/' });
        throw redirect(303, '/login');
    }
} satisfies Actions;
