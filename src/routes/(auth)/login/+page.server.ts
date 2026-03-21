import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
    login: async ({ cookies }) => {
        // Old student-number form action removed.
        // SSO login is handled via /auth/sso/login GET route.
        // This action is kept as a fallback that redirects to SSO login.
        throw redirect(303, '/auth/sso/login');
    },
    logout: async (event) => {
        event.cookies.delete('session', { path: '/' });
        event.cookies.delete('admin_session', { path: '/' });
        throw redirect(303, '/login');
    }
} satisfies Actions;
