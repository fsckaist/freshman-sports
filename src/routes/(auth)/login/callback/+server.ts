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
        const msg = JSON.stringify({ ko: '잘못된 인증 요청입니다. 다시 로그인해 주세요.', en: 'Invalid authentication request. Please log in again.' });
        throw redirect(303, '/login?error=' + encodeURIComponent(msg));
    }

    // Exchange code for user info
    let rawUserInfo;
    try {
        rawUserInfo = await ssoClient.getUserInfo(code);
    } catch (e) {
        console.error('SSO getUserInfo error:', e);
        const msg = JSON.stringify({ ko: 'SSO 서버와 통신 중 오류가 발생했습니다.', en: 'An error occurred while communicating with the SSO server.' });
        throw redirect(303, '/login?error=' + encodeURIComponent(msg));
    }

    // Parse KAIST-specific user data
    if (dev) {
        console.log('SSO raw user info:', JSON.stringify(rawUserInfo, null, 2));
    }
    const userData = parseUserData(rawUserInfo);
    if (dev) {
        console.log('Parsed user data:', JSON.stringify(userData, null, 2));
    }

    const handleAuthError = (message: string) => {
        const errorUrl = new URL('/login', url.origin);
        errorUrl.searchParams.set('error', message);
        return redirect(303, ssoClient.getLogoutUrl(userData.sid, errorUrl.toString()));
    };

    if (!userData.isEligible) {
        const msg = JSON.stringify({ ko: 'KAIST 학적 정보를 확인할 수 없습니다. KAIST IAM으로 다시 로그인해주세요.', en: 'Could not verify KAIST student information. Please log in again with KAIST IAM.' });
        throw handleAuthError(msg);
    }

    // Look up user in our database by student number
    const existingUsers = await db.select()
        .from(users)
        .where(eq(users.studentNumber, userData.studentNumber))
        .limit(1);

    if (existingUsers.length === 0) {
        const msg = JSON.stringify({ 
            ko: `해당 학번(${userData.studentNumber})에 해당하는 학우분께서는 새내기 체육대회에 참가할 수 없습니다. 문제가 있다고 판단되시면 새내기학생회에 문의해주세요.`, 
            en: `The student with ID (${userData.studentNumber}) is not eligible to participate in the Freshman Sports event. Please contact the Freshman Student Council if you believe this is an error.` 
        });
        throw handleAuthError(msg);
    }

    const dbUser = existingUsers[0];

    // Link SSO account on first login, reject if already linked to a different account
    if (dbUser.authId && dbUser.authId !== userData.uid) {
        const msg = JSON.stringify({ ko: '이 학번은 이미 다른 SSO 계정으로 연결되어 있습니다. 기존에 사용한 계정으로 로그인해주세요.', en: 'This student ID is already linked to a different SSO account. Please log in with the previously used account.' });
        throw handleAuthError(msg);
    }

    if (!dbUser.authId) {
        await db.update(users)
            .set({
                authId: userData.uid,
                name: userData.name || dbUser.name,
                email: userData.email || dbUser.email,
                gender: userData.gender || dbUser.gender,
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
