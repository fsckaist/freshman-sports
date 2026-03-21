import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
    default: async ({ cookies }) => {
        cookies.delete('session', { path: '/' });
        cookies.delete('admin_session', { path: '/' });
        throw redirect(302, '/login');
    }
} satisfies Actions;
