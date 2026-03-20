import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { ssoClient } from '$lib/server/sso';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
    const { url, state } = ssoClient.getLoginParams();

    // Store state in a temporary cookie for CSRF validation
    cookies.set('sso_state', state, {
        path: '/',
        httpOnly: true,
        secure: !dev,
        sameSite: 'lax',
        maxAge: 60 * 5 // 5 minutes
    });

    // Redirect to SPARCS SSO login page
    throw redirect(302, url + '&social_enabled=0&show_disabled_button=0');
};
