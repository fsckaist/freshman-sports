import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sports, users, rosters, system_config } from '$lib/server/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { getRemainingTimeLabel } from '$lib/server/timeUtils';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
    const user = locals.user;
    if (!user) throw redirect(302, '/login');

    // State guard: apply page only visible during REGISTRATION
    const { eventState, registrationDeadline } = await parent();
    if (eventState !== 'REGISTRATION') throw redirect(302, '/');

    // Access guard: only participants (students or proctors) can access
    const isStudent = !user.isProctor && user.classId != null;
    if (!isStudent && !user.isProctor) {
        throw redirect(302, '/');
    }

    if (!user.classId) {
        // If a user doesn't belong to a class, they can't see the sports rosters or apply
        return {
            deadlineDate: JSON.stringify({ ko: "03월 15일 23:59", en: "03/15 23:59" }),
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

    // Calculate deadline
    let deadlineStr = JSON.stringify({ ko: "미정", en: "TBD" });
    let daysRemaining = "0";
    let timeRemaining = JSON.stringify({ ko: "0분", en: "0m" });

    if (registrationDeadline) {
        const d = new Date(registrationDeadline);
        const pad = (n: number) => String(n).padStart(2, '0');
        deadlineStr = JSON.stringify({
            ko: `${pad(d.getMonth() + 1)}월 ${pad(d.getDate())}일 ${pad(d.getHours())}:${pad(d.getMinutes())}`,
            en: `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
        });

        const today = new Date();
        const diffTime = registrationDeadline.getTime() - today.getTime();
        daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24))).toString();
        timeRemaining = getRemainingTimeLabel(registrationDeadline);
    }

    // 3. Transform Data Output
    const sportsData = allSports.map((sport) => {
        // Filter players for this specific sport in the same class
        const currentSportRosters = classRosters.filter(r => r.sportId === sport.id);
        const currentSpots = currentSportRosters.length;
        const isCurrentUserEnrolled = currentSportRosters.some(r => r.userId === user.id);

        // Determine Button State
        let buttonState: "apply" | "cancel" | "closed" | "disabled" = "apply";
        let alertMessage: string | undefined = undefined;

        // Gender Check
        const isGenderMismatched =
            (sport.requiredGender === 'MALE_ONLY' && user.gender !== 'MALE') ||
            (sport.requiredGender === 'FEMALE_ONLY' && user.gender !== 'FEMALE');

        if (isCurrentUserEnrolled) {
            buttonState = "cancel";
        } else if (isGenderMismatched) {
            buttonState = "disabled";
        } else if (currentSpots >= sport.maxPlayers) {
            buttonState = "closed";
        }

        // Evaluate Alert Message (if not already set by gender check)
        if (!alertMessage && currentSpots < sport.minPlayers) {
            alertMessage = JSON.stringify({
                ko: `최소 참여 인원이 충족되지 않았어요. (${currentSpots}/${sport.minPlayers})`,
                en: `Minimum participation not met. (${currentSpots}/${sport.minPlayers})`
            });
        }

        // Format Roster array mimicking the frontend structure
        const rostersFormatted = currentSportRosters.map(r => ({
            name: r.userName || "알수없음",
            isCurrentUser: r.userId === user.id
        }));

        // Dynamically create description lines
        const descriptionLines = [
            JSON.stringify({
                ko: `주전 선수 ${sport.minPlayers}명 + 예비 선수 (총 ${sport.maxPlayers}명)`,
                en: `${sport.minPlayers} players + substitutes (total ${sport.maxPlayers})`
            })
        ];
        if (sport.slug === 'futsal') descriptionLines.push(JSON.stringify({ ko: "전반 15분 / 휴식 5분 / 후반 15분", en: "15m 1st / 5m break / 15m 2nd" }));
        if (sport.slug === 'basketball') descriptionLines.push(JSON.stringify({ ko: "전반 10분 / 휴식 5분 / 후반 10분", en: "10m 1st / 5m break / 10m 2nd" }));
        if (sport.slug.includes('badminton')) descriptionLines.push(JSON.stringify({ ko: "21점 3세트", en: "3 sets, 21 points each" }));

        return {
            id: sport.id,
            title: sport.name,
            currentSpots,
            maxSpots: sport.maxPlayers,
            descriptionLines,
            rosters: rostersFormatted,
            buttonState,
            alertMessage,
            requiredGender: sport.requiredGender
        };
    });

    return {
        deadlineDate: deadlineStr,
        timeRemaining,
        sports: sportsData
    };
};

export const actions: Actions = {
    apply: async ({ request, locals }) => {
        const user = locals.user;
        if (!user) return fail(401, { message: JSON.stringify({ ko: "권한이 없어요.", en: "Permission denied." }) });
        const isStudent = !user.isProctor && user.classId != null;
        if (!isStudent && !user.isProctor) return fail(401, { message: JSON.stringify({ ko: "권한이 없어요.", en: "Permission denied." }) });
        if (!user.classId && !user.isProctor) return fail(403, { message: JSON.stringify({ ko: "소속된 반 정보가 없어요.", en: "Class information not found." }) });

        const formData = await request.formData();
        const sportId = formData.get('sportId')?.toString();

        if (!sportId) {
            return fail(400, { message: JSON.stringify({ ko: "종목 아이디가 제공되지 않았어요.", en: "Sport ID was not provided." }) });
        }

        // Check 1: Event State Check (Registration must be ONGOING)
        const configs = await db.select().from(system_config).limit(1);
        const eventState = configs[0]?.eventState ?? 'REGISTRATION';
        if (eventState !== 'REGISTRATION') {
            return fail(403, { message: JSON.stringify({ ko: "지금은 신청 기간이 아니에요.", en: "It is not the registration period right now." }) });
        }

        // Check 2: User is already in the roster for this sport
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
            return fail(400, { message: JSON.stringify({ ko: "이미 지원한 종목이에요.", en: "You have already applied for this sport." }) });
        }

        // Check 2: Max Players constraints
        // Get Sport Info
        const sportInfoArr = await db.select().from(sports).where(eq(sports.id, sportId)).limit(1);
        const sportInfo = sportInfoArr[0];
        if (!sportInfo) {
            return fail(404, { message: JSON.stringify({ ko: "존재하지 않는 종목이에요.", en: "This sport does not exist." }) });
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
            return fail(400, { message: JSON.stringify({ ko: "해당 종목의 모집이 마감되었어요.", en: "Registration for this sport has closed." }) });
        }

        // Check 3: Gender Compatibility
        const isGenderMismatched =
            (sportInfo.requiredGender === 'MALE_ONLY' && user.gender !== 'MALE') ||
            (sportInfo.requiredGender === 'FEMALE_ONLY' && user.gender !== 'FEMALE');

        if (isGenderMismatched) {
            const koLabel = sportInfo.requiredGender === 'MALE_ONLY' ? "남성" : "여성";
            const enLabel = sportInfo.requiredGender === 'MALE_ONLY' ? "men" : "women";
            return fail(400, { message: JSON.stringify({ ko: `${koLabel} 전용 종목입니다.`, en: `This sport is for ${enLabel} only.` }) });
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
            return fail(500, { message: JSON.stringify({ ko: "지원 중 오류가 발생했어요.", en: "An error occurred during application." }) });
        }

        return { success: true };
    },

    cancel: async ({ request, locals }) => {
        const user = locals.user;
        if (!user) return fail(401, { message: JSON.stringify({ ko: "권한이 없어요.", en: "Permission denied." }) });
        const isStudent = !user.isProctor && user.classId != null;
        if (!isStudent && !user.isProctor) return fail(401, { message: JSON.stringify({ ko: "권한이 없어요.", en: "Permission denied." }) });
        if (!user.classId && !user.isProctor) return fail(403, { message: JSON.stringify({ ko: "소속된 반 정보가 없어요.", en: "Class information not found." }) });

        const formData = await request.formData();
        const sportId = formData.get('sportId')?.toString();

        if (!sportId) {
            return fail(400, { message: JSON.stringify({ ko: "종목 아이디가 제공되지 않았어요.", en: "Sport ID was not provided." }) });
        }

        // State Check: Only allow apply/cancel during REGISTRATION
        const configs = await db.select().from(system_config).limit(1);
        const eventState = configs[0]?.eventState ?? 'REGISTRATION';
        if (eventState !== 'REGISTRATION') {
            return fail(403, { message: JSON.stringify({ ko: "지금은 신청 취소 기간이 아니에요.", en: "It is not the cancellation period right now." }) });
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
            return fail(500, { message: JSON.stringify({ ko: "취소 중 오류가 발생했어요.", en: "An error occurred during cancellation." }) });
        }

        return { success: true };
    }
};
