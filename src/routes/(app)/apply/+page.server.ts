import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sports, users, rosters } from '$lib/server/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    // 1. User Context
    const user = locals.user;
    if (!user) {
        throw redirect(302, '/login');
    }

    if (!user.classId) {
        // If a user doesn't belong to a class, they can't see the sports rosters or apply
        return {
            deadlineDate: "03월 15일 23:59",
            daysRemaining: "12",
            sports: []
        };
    }

    // 2. Data Fetching
    // Fetch all sports ordered by displayOrder
    const allSports = await db.select().from(sports).orderBy(asc(sports.displayOrder));

    // Fetch rosters representing the user's class
    const classRosters = await db.select({
        sportId: rosters.sportId,
        userId: rosters.userId,
        userName: users.name
    })
        .from(rosters)
        .innerJoin(users, eq(rosters.userId, users.id))
        .where(eq(rosters.classId, user.classId));

    // Calculate deadline (Hardcoded for now as per mock, can be dynamic later)
    const deadlineStr = "03월 15일 23:59";
    const deadlineDate = new Date("2026-03-15T23:59:59+09:00");
    const today = new Date();
    const diffTime = Math.abs(deadlineDate.getTime() - today.getTime());
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 3. Transform Data Output
    const sportsData = allSports.map((sport) => {
        // Filter players for this specific sport in the same class
        const currentSportRosters = classRosters.filter(r => r.sportId === sport.id);
        const currentSpots = currentSportRosters.length;
        const isCurrentUserEnrolled = currentSportRosters.some(r => r.userId === user.id);

        // Determine Button State
        let buttonState: "apply" | "cancel" | "closed" | "disabled" = "apply";
        if (isCurrentUserEnrolled) {
            buttonState = "cancel";
        } else if (currentSpots >= sport.maxPlayers) {
            buttonState = "closed";
        }

        // Evaluate Alert Message
        let alertMessage: string | undefined = undefined;
        if (currentSpots < sport.minPlayers) {
            alertMessage = `최소 참여 인원이 충족되지 않았어요. (${currentSpots}/${sport.minPlayers})`;
        }

        // Format Roster array mimicking the frontend structure
        const rostersFormatted = currentSportRosters.map(r => ({
            name: r.userName || "알수없음",
            isCurrentUser: r.userId === user.id
        }));

        // Dynamically create description lines
        const descriptionLines = [
            `주전 선수 ${sport.minPlayers}명 + 예비 선수 (총 ${sport.maxPlayers}명)`
        ];
        if (sport.slug === 'futsal') descriptionLines.push("전반 20분 / 휴식 5분 / 후반 20분");
        if (sport.slug === 'basketball') descriptionLines.push("전반 10분 / 휴식 5분 / 후반 10분");
        if (sport.slug.includes('badminton')) descriptionLines.push("21점 3세트");

        return {
            id: sport.id,
            title: sport.name,
            currentSpots,
            maxSpots: sport.maxPlayers,
            descriptionLines,
            rosters: rostersFormatted,
            buttonState,
            alertMessage
        };
    });

    return {
        deadlineDate: deadlineStr,
        daysRemaining: daysRemaining.toString(),
        sports: sportsData
    };
};

export const actions: Actions = {
    apply: async ({ request, locals }) => {
        const user = locals.user;
        if (!user || !user.classId) {
            return fail(401, { message: "권한이 없어요." });
        }

        const formData = await request.formData();
        const sportId = formData.get('sportId')?.toString();

        if (!sportId) {
            return fail(400, { message: "종목 아이디가 제공되지 않았어요." });
        }

        // Check 1: User is already in the roster for this sport
        const existingRoster = await db.select()
            .from(rosters)
            .where(
                and(
                    eq(rosters.userId, user.id),
                    eq(rosters.sportId, sportId)
                )
            )
            .limit(1);

        if (existingRoster.length > 0) {
            return fail(400, { message: "이미 지원한 종목이에요." });
        }

        // Check 2: Max Players constraints
        // Get Sport Info
        const sportInfoArr = await db.select().from(sports).where(eq(sports.id, sportId)).limit(1);
        const sportInfo = sportInfoArr[0];
        if (!sportInfo) {
            return fail(404, { message: "존재하지 않는 종목이에요." });
        }

        // Get class roster count for this sport
        const currentRosterCountArr = await db.select({
            sportId: rosters.sportId
        })
            .from(rosters)
            .where(
                and(
                    eq(rosters.classId, user.classId),
                    eq(rosters.sportId, sportId)
                )
            );

        if (currentRosterCountArr.length >= sportInfo.maxPlayers) {
            return fail(400, { message: "해당 종목의 모집이 마감되었어요." });
        }

        // Insert
        try {
            await db.insert(rosters).values({
                classId: user.classId,
                userId: user.id,
                sportId: sportId
            });
        } catch (e) {
            console.error("Apply Roster Error:", e);
            return fail(500, { message: "지원 중 오류가 발생했어요." });
        }

        return { success: true };
    },

    cancel: async ({ request, locals }) => {
        const user = locals.user;
        if (!user || !user.classId) {
            return fail(401, { message: "권한이 없어요." });
        }

        const formData = await request.formData();
        const sportId = formData.get('sportId')?.toString();

        if (!sportId) {
            return fail(400, { message: "종목 아이디가 제공되지 않았어요." });
        }

        // Delete from rosters
        try {
            // Note: Since each user can only be in one roster per sport, matching userId and sportId is safe.
            // Drizzle delete operation does not easily return amount of affected rows without `.returning` but standard execution is fine.
            await db.delete(rosters).where(
                and(
                    eq(rosters.userId, user.id),
                    eq(rosters.sportId, sportId)
                )
            );
        } catch (e) {
            console.error("Cancel Roster Error:", e);
            return fail(500, { message: "취소 중 오류가 발생했어요." });
        }

        return { success: true };
    }
};
