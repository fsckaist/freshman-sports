import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { matches } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, locals }) => {
    const user = locals.user;
    if (!user || (!user.isManager && !user.isAdmin)) {
        throw error(403, 'Permission denied');
    }

    const { matchId } = params;
    const body = await request.json();
    const { scoreA, scoreB, matchNotes } = body;

    if (!matchId) {
        throw error(400, 'Missing matchId');
    }

    // Only save notes for non-verified matches
    const match = await db.query.matches.findFirst({
        where: (matches, { eq }) => eq(matches.id, matchId)
    });

    if (!match) {
        throw error(404, 'Match not found');
    }

    if (match.isVerified) {
        throw error(400, 'Cannot modify verified match');
    }

    await db.update(matches)
        .set({
            scoreA: typeof scoreA === 'number' ? scoreA : match.scoreA,
            scoreB: typeof scoreB === 'number' ? scoreB : match.scoreB,
            matchNotes: matchNotes || match.matchNotes
        })
        .where(eq(matches.id, matchId));

    return json({ success: true });
};
