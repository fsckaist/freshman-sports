import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    return {
        locale: locals.locale ?? 'ko',
        isImpersonating: locals.isImpersonating ?? false,
        user: locals.user
    };
};
