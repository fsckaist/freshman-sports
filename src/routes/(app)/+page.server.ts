import { redirect, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users, matches, schedules, sports, classes, rosters } from '$lib/server/db/schema';
import { eq, or, and, asc, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { PageServerLoad } from './$types';

function serverDecode(jsonStr: string | null, lang: 'ko' | 'en') {
    if (!jsonStr) return "";
    try {
        const obj = JSON.parse(jsonStr);
        return obj[lang] || obj['ko'] || "";
    } catch {
        return jsonStr;
    }
}

export const load: PageServerLoad = async ({ locals }) => {
    // 1. Authentication Check (handled by hooks.server.ts via JWT)
    const user = locals.user;

    if (!user) {
        throw redirect(302, '/login');
    }

    try {
        // User profile comes from hooks (JWT-verified)
        const userProfile = {
            id: user.id,
            username: user.name,
            studentNumber: user.studentNumber,
            classId: user.classId,
            phoneNumber: user.phoneNumber
        };

        // Prepare alias for matches query
        const classA = alias(classes, 'classA');
        const classB = alias(classes, 'classB');

        // BATCH QUERIES: 6 distinct sequential queries combined into 1 parallel fetch
        const [
            userSports,
            classMatches,
            proctorsList,
            allSports,
            rawRosters,
            userMatches
        ] = await Promise.all([
            // 1. Fetch user's registered sports
            db.select({ name: sports.name })
                .from(rosters)
                .innerJoin(sports, eq(rosters.sportId, sports.id))
                .where(eq(rosters.userId, userProfile.id))
                .orderBy(asc(sports.displayOrder)),

            // 2. Fetch Class Info
            userProfile.classId
                ? db.select({ classNumber: classes.classNumber })
                    .from(classes)
                    .where(eq(classes.id, userProfile.classId))
                    .limit(1)
                : Promise.resolve([]),

            // 3. Fetch Proctors
            userProfile.classId
                ? db.select({ name: users.name })
                    .from(users)
                    .where(and(eq(users.classId, userProfile.classId), eq(users.isProctor, true)))
                : Promise.resolve([]),

            // 4. Fetch ALL sports
            db.select({
                id: sports.id,
                name: sports.name,
                displayOrder: sports.displayOrder
            }).from(sports).orderBy(asc(sports.displayOrder)),

            // 5. Fetch class rosters
            userProfile.classId
                ? db.select({ sportId: rosters.sportId, playerName: users.name })
                    .from(rosters)
                    .innerJoin(users, eq(rosters.userId, users.id))
                    .where(eq(rosters.classId, userProfile.classId))
                : Promise.resolve([]),

            // 6. Fetch Matches associated with the user's class
            db.select({
                id: matches.id,
                name: matches.name,
                time: schedules.startTime,
                location: matches.location,
                status: matches.status,
                teamA: classA.classNumber,
                teamB: classB.classNumber,
                sportName: sports.name,
                sportId: sports.id
            })
                .from(matches)
                .leftJoin(schedules, eq(matches.scheduleId, schedules.id))
                .innerJoin(sports, eq(matches.sportId, sports.id))
                .innerJoin(classA, eq(matches.classAId, classA.id))
                .innerJoin(classB, eq(matches.classBId, classB.id))
                .where(
                    userProfile.classId ? or(
                        eq(matches.classAId, userProfile.classId),
                        eq(matches.classBId, userProfile.classId)
                    ) : eq(matches.id, '00000000-0000-0000-0000-000000000000') // Dummy false condition
                )
                .orderBy(
                    asc(sql`CASE 
                        WHEN ${matches.status} = 'ONGOING' THEN 1 
                        WHEN ${matches.status} = 'SCHEDULED' THEN 2 
                        WHEN ${matches.status} = 'PENDING_SCHEDULE' THEN 3 
                        WHEN ${matches.status} = 'FINISHED' THEN 4 
                        ELSE 5 
                    END`),
                    asc(schedules.startTime)
                )
        ]);

        const userSportsString = userSports.length > 0
            ? userSports.map(s => s.name).join(', ')
            : '참여 종목 없음';

        let classNumber: number | string | null = null;
        let proctorsString = '없음';
        let groupedRosters: Array<{ sport: string, players: string }> = [];
        let rosterBySport = new Map<string, string[]>();

        if (userProfile.classId) {
            if (classMatches.length > 0) {
                classNumber = classMatches[0].classNumber;
            }

            if (proctorsList.length > 0) {
                proctorsString = proctorsList.map(p => p.name || '알수없음').join(', ');
            }

            // Group the raw rosters by sportId
            for (const r of rawRosters) {
                if (!rosterBySport.has(r.sportId)) {
                    rosterBySport.set(r.sportId, []);
                }
                if (r.playerName) {
                    rosterBySport.get(r.sportId)!.push(r.playerName);
                }
            }

            // Map all available sports, pulling from the grouped Map
            groupedRosters = allSports.map((sport) => {
                const playersList = rosterBySport.get(sport.id) || [];
                // If there are players, comma join them. Else return '출전 선수가 없어요.'
                return {
                    sport: sport.name,
                    players: playersList.length > 0 ? playersList.join(', ') : '출전 선수가 없어요.'
                };
            });
        }

        const formattedAllMatches = userMatches.map((match) => {
            const playersString = (rosterBySport.get(match.sportId) || []).join(', ');

            // Format the startTime to "03월 15일 14시 00분" format
            const d = match.time ? new Date(match.time) : new Date();
            const mo = String(d.getMonth() + 1).padStart(2, '0');
            const da = String(d.getDate()).padStart(2, '0');
            const ho = String(d.getHours()).padStart(2, '0');
            const mi = String(d.getMinutes()).padStart(2, '0');

            const formattedTime = match.time ? `${mo}월 ${da}일 ${ho}시 ${mi}분` : "시간 조율 필요";

            // Map status enum to Korean string
            let statusKo = "예정";
            if (match.status === "ONGOING") statusKo = "진행";
            else if (match.status === "FINISHED") statusKo = "종료";
            else if (match.status === "CANCELED") statusKo = "취소";
            else if (match.status === "PENDING_SCHEDULE") statusKo = "일정 조율 필요";

            return {
                id: match.id,
                statusOriginal: match.status,
                title: JSON.stringify({
                    ko: `${serverDecode(match.sportName, 'ko')} ${serverDecode(match.name, 'ko')}`.trim(),
                    en: `${serverDecode(match.sportName, 'en')} ${serverDecode(match.name, 'en')}`.trim()
                }),
                time: formattedTime,
                status: statusKo,
                teamA: JSON.stringify({ ko: `${match.teamA}반`, en: `Class ${match.teamA}` }),
                teamB: JSON.stringify({ ko: `${match.teamB}반`, en: `Class ${match.teamB}` }),
                location: match.location || '미정',
                players: playersString || '선수 없음'
            };
        });

        // Split into confirmed and pending
        const confirmedSchedules = formattedAllMatches.filter(m => m.statusOriginal !== "PENDING_SCHEDULE");
        const pendingSchedules = formattedAllMatches.filter(m => m.statusOriginal === "PENDING_SCHEDULE");

        // QUERY 5: Build Notice Card logic for Pending Matches Action Items
        // Re-using userMatches fetched earlier but ensuring only 'PENDING_SCHEDULE' matches where opponent is NOT eliminated
        // Notice: 'matches.classAId' and 'matches.classBId' can be null if it's an eliminated slot
        const userParticipatingSportsNames = userSports.map(s => s.name);

        const pendingNotices = userMatches
            .filter(m => m.status === "PENDING_SCHEDULE" && m.teamA !== null && m.teamB !== null && userParticipatingSportsNames.includes(m.sportName))
            .map(m => {
                let opponentClass = '미정';
                if (m.teamA && m.teamB) {
                    const opponentNum = m.teamA === classNumber ? m.teamB : m.teamA;
                    opponentClass = JSON.stringify({ ko: `${opponentNum}반`, en: `Class ${opponentNum}` });
                }

                return {
                    id: m.id,
                    sportName: m.sportName,
                    opponent: opponentClass
                };
            });

        if (classNumber == null) {
            classNumber = 'N/A';
        }

        // 3. Return the mapped data
        return {
            dashboardUser: {
                userId: userProfile.id,
                username: userProfile.username,
                studentNumber: userProfile.studentNumber,
                phoneNumber: userProfile.phoneNumber,
                sports: userSports.map(s => s.name)
            },
            classInfo: {
                classNumber,
                proctors: proctorsString,
                rosters: groupedRosters
            },
            confirmedSchedules,
            pendingSchedules,
            pendingMatches: pendingNotices
        };
    } catch (e) {
        // Log the error internally and return a safe error state or 500 error
        console.error("Dashboard Load Error:", e);
        throw error(500, '데이터를 불러오는 중 오류가 발생했습니다.');
    }
};
