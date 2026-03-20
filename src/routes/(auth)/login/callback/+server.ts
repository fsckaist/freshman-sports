import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { ssoClient, parseUserData } from '$lib/server/sso';
import { signToken } from '$lib/server/jwt';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const storedState = cookies.get('sso_state');

    // Clean up the state cookie immediately
    cookies.delete('sso_state', { path: '/' });

    // Validate CSRF state
    if (!code || !state || !storedState || state !== storedState) {
        throw redirect(303, '/login?error=' + encodeURIComponent('잘못된 인증 요청입니다. 다시 로그인해 주세요.'));
    }

    // Exchange code for user info
    let rawUserInfo;
    try {
        rawUserInfo = await ssoClient.getUserInfo(code);
    } catch (e) {
        console.error('SSO getUserInfo error:', e);
        throw redirect(303, '/login?error=' + encodeURIComponent('SSO 서버와 통신 중 오류가 발생했습니다.'));
    }

    // Parse KAIST-specific user data
    const userData = parseUserData(rawUserInfo);

    if (!userData.studentNumber) {
        throw redirect(303, '/login?error=' + encodeURIComponent('KAIST 학번 정보를 확인할 수 없습니다. 관리자에게 문의하세요.'));
    }

    // Look up user in our database by student number
    const existingUsers = await db.select()
        .from(users)
        .where(eq(users.studentNumber, userData.studentNumber))
        .limit(1);

    if (existingUsers.length === 0) {
        throw redirect(303, '/login?error=' + encodeURIComponent(`등록되지 않은 학번(${userData.studentNumber})입니다. 관리자에게 문의하세요.`));
    }

    const dbUser = existingUsers[0];

    // Update authId if not already set (first SSO login for this user)
    if (!dbUser.authId || dbUser.authId !== userData.uid) {
        await db.update(users)
            .set({
                authId: userData.uid,
                name: userData.name || dbUser.name,
                email: userData.email || dbUser.email,
            })
            .where(eq(users.id, dbUser.id));
    }

    // Sign JWT and set as session cookie
    const token = signToken({
        uid: userData.uid,
        sid: userData.sid,
        studentNumber: userData.studentNumber,
        dbUserId: dbUser.id,
    });

    cookies.set('session', token, {
        path: '/',
        httpOnly: true,
        secure: !dev,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    // Redirect based on agreement status
    if (dbUser.agreedPrivacy && dbUser.agreedRules) {
        throw redirect(303, '/');
    } else {
        throw redirect(303, '/register/rules');
    }
};
