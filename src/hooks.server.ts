import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '$lib/server/jwt';

// --- In-Memory TTL Cache ---
const CACHE_TTL_MS = 60 * 1000; // 1 minute
const userCache = new Map<string, { data: any, expiry: number }>();

function getCachedUser(id: string) {
    const item = userCache.get(id);
    if (!item) return null;
    if (Date.now() > item.expiry) {
        userCache.delete(id);
        return null;
    }
    return item.data;
}

function setCachedUser(id: string, data: any) {
    userCache.set(id, { data, expiry: Date.now() + CACHE_TTL_MS });
    // Cleanup if cache grows too large to prevent memory leak
    if (userCache.size > 1000) {
        let count = 0;
        for (const [key, val] of userCache.entries()) {
            if (Date.now() > val.expiry || count++ > 200) userCache.delete(key);
        }
    }
}

export function invalidateUserCache(id: string) {
    userCache.delete(id);
}
// ---------------------------

export const handle: Handle = async ({ event, resolve }) => {
    const token = event.cookies.get('session');

    if (token) {
        try {
            const payload = verifyToken(token);
            // Validate that dbUserId looks like a UUID before querying
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (payload?.dbUserId && uuidRegex.test(payload.dbUserId)) {
                let userObj = getCachedUser(payload.dbUserId);
                if (!userObj) {
                    const fetchedUsers = await db.select({
                        id: users.id,
                        authId: users.authId,
                        studentNumber: users.studentNumber,
                        email: users.email,
                        phoneNumber: users.phoneNumber,
                        name: users.name,
                        gender: users.gender,
                        classId: users.classId,
                        isManager: users.isManager,
                        isReferee: users.isReferee,
                        isAdmin: users.isAdmin,
                        isProctor: users.isProctor,
                        agreedRules: users.agreedRules,
                        agreedPrivacy: users.agreedPrivacy
                    }).from(users).where(eq(users.id, payload.dbUserId)).limit(1);
                    if (fetchedUsers.length > 0) {
                        userObj = fetchedUsers[0];
                        setCachedUser(payload.dbUserId, userObj);
                    }
                }
                
                if (userObj) {
                    event.locals.user = userObj;
                }
            } else if (token) {
                // Invalid or legacy cookie — clear it
                console.warn('Invalid session token (not a valid JWT or bad dbUserId), clearing cookie.');
                event.cookies.delete('session', { path: '/' });
            }
        } catch (e) {
            console.error('Error verifying JWT session:', e);
            // Clear corrupt cookie to prevent repeated errors
            event.cookies.delete('session', { path: '/' });
        }
    }

    // Detect impersonation mode
    if (event.cookies.get('admin_session')) {
        event.locals.isImpersonating = true;
    }

    // Extract locale from cookie for SSR support or default to 'ko'
    const cookieLocale = event.cookies.get('locale');
    if (cookieLocale === 'ko' || cookieLocale === 'en') {
        event.locals.locale = cookieLocale;
    } else {
        event.locals.locale = 'ko';
    }

    const { pathname } = event.url;
    const user = event.locals.user;

    if (!user) {
        // Allow unauthenticated access to these paths
        if (!pathname.startsWith('/login') && !pathname.startsWith('/register')) {
            throw redirect(303, '/login');
        }
    }
    else {
        const needsGender = !user.gender;
        const needsRules = !user.agreedRules;
        const needsPolicy = !user.agreedPrivacy;

        if (needsGender) {
            if (pathname !== '/register/gender' && pathname !== '/logout') {
                throw redirect(303, '/register/gender');
            }
        } else if (needsRules) {
            if (pathname !== '/register/rules' && pathname !== '/info/rules' && pathname !== '/logout') {
                throw redirect(303, '/register/rules');
            }
        } else if (needsPolicy) {
            if (pathname !== '/register/privacy' && pathname !== '/info/privacy' && pathname !== '/logout') {
                throw redirect(303, '/register/privacy');
            }
        }
        else {
            if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/info') || pathname === '/') {
                if (pathname !== '/') {
                    throw redirect(303, '/');
                }
            }

            const isOnlyReferee = user.isReferee && !user.isAdmin && !user.isManager && !user.isProctor && !user.classId;
            if (isOnlyReferee && pathname !== '/referee-notice' && pathname !== '/logout') {
                throw redirect(303, '/referee-notice');
            }

            const isUnauthorized = !user.isReferee && !user.isAdmin && !user.isManager && !user.isProctor && !user.classId;
            if (isUnauthorized && pathname !== '/unauthorized' && pathname !== '/logout') {
                throw redirect(303, '/unauthorized');
            }
        }
    }

    return resolve(event);
};