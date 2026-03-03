import { redirect, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users, matches, schedules, sports, classes, rosters } from '$lib/server/db/schema';
import { eq, or, and, asc } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, locals }) => {
    // 1. Authentication Check
    // Get the session token from cookies
    const sessionToken = cookies.get('session');

    // Add logging to debug the incoming session cookie
    console.log('Session Cookie in Dashboard:', sessionToken);

    if (!sessionToken) {
        throw redirect(302, '/login');
    }

    try {
        // Here we use the session token (which we stored as user.id in login) 
        // to directly query the database.
        const userId = sessionToken;

        // 2. Database Queries

        // Fetch User Profile
        const userProfiles = await db.select({
            id: users.id,
            username: users.name,
            studentNumber: users.studentNumber,
            classId: users.classId,
            phoneNumber: users.phoneNumber
        })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        const userProfile = userProfiles[0];

        if (!userProfile) {
            // Invalid session ID or user deleted
            cookies.delete('session', { path: '/' });
            throw redirect(302, '/login');
        }

        // QUERY 2: Fetch Class Info (if applicable)
        let classNumber = null;
        let proctorsString = '없음';
        let groupedRosters: Array<{ sport: string, players: string }> = [];

        if (userProfile.classId) {
            // Get the class number
            const classMatches = await db.select({
                classNumber: classes.classNumber
            })
                .from(classes)
                .where(eq(classes.id, userProfile.classId))
                .limit(1);

            if (classMatches.length > 0) {
                classNumber = classMatches[0].classNumber;
            }

            // Get proctors for this class
            const proctorsList = await db.select({
                name: users.name
            })
                .from(users)
                .where(and(
                    eq(users.classId, userProfile.classId),
                    eq(users.isProctor, true)
                ));

            if (proctorsList.length > 0) {
                proctorsString = proctorsList.map(p => p.name || '알수없음').join(', ');
            }

            // Fetch ALL sports to ensure every sport is represented
            const allSports = await db.select({
                id: sports.id,
                name: sports.name,
                displayOrder: sports.displayOrder
            }).from(sports).orderBy(asc(sports.displayOrder));

            // Get Rosters grouped by Sport
            const rawRosters = await db.select({
                sportId: rosters.sportId,
                playerName: users.name
            })
                .from(rosters)
                .innerJoin(users, eq(rosters.userId, users.id))
                .where(eq(rosters.classId, userProfile.classId));

            // Group the raw rosters by sportId
            const rostersMap = new Map<string, string[]>();
            for (const r of rawRosters) {
                if (!rostersMap.has(r.sportId)) {
                    rostersMap.set(r.sportId, []);
                }
                if (r.playerName) {
                    rostersMap.get(r.sportId)!.push(r.playerName);
                }
            }

            // Map all available sports, pulling from the grouped Map
            groupedRosters = allSports.map((sport) => {
                const playersList = rostersMap.get(sport.id) || [];
                // If there are players, comma join them. Else return '출전 선수가 없어요.'
                return {
                    sport: sport.name,
                    players: playersList.length > 0 ? playersList.join(', ') : '출전 선수가 없어요.'
                };
            });
        }

        // QUERY 3: Fetch Matches associated with the user's class
        const classA = alias(classes, 'classA');
        const classB = alias(classes, 'classB');

        const userMatches = await db.select({
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
            .innerJoin(schedules, eq(matches.scheduleId, schedules.id))
            .innerJoin(sports, eq(matches.sportId, sports.id))
            .innerJoin(classA, eq(matches.classAId, classA.id))
            .innerJoin(classB, eq(matches.classBId, classB.id))
            .where(
                userProfile.classId ? or(
                    eq(matches.classAId, userProfile.classId),
                    eq(matches.classBId, userProfile.classId)
                ) : eq(matches.id, '00000000-0000-0000-0000-000000000000') // Dummy false condition if no class
            )
            .orderBy(asc(schedules.startTime));

        // Formatter for dates (Korean format)
        const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        // QUERY 4: Fetch Players matching the specific roster for each match concurrently
        const formattedSchedules = await Promise.all(
            userMatches.map(async (match) => {
                let playersString = '';

                if (userProfile.classId) {
                    const playersInSport = await db.select({
                        name: users.name
                    })
                        .from(rosters)
                        .innerJoin(users, eq(rosters.userId, users.id))
                        .where(and(
                            eq(rosters.classId, userProfile.classId),
                            eq(rosters.sportId, match.sportId)
                        ));

                    playersString = playersInSport.map(p => p.name || '알수없음').join(', ');
                }

                // Format the startTime to "03월 15일 14시 00분" format
                // Intl.DateTimeFormat gives: "03. 15. 14:00" -> string replacement to match expectations
                const d = match.time ? new Date(match.time) : new Date();
                const mo = String(d.getMonth() + 1).padStart(2, '0');
                const da = String(d.getDate()).padStart(2, '0');
                const ho = String(d.getHours()).padStart(2, '0');
                const mi = String(d.getMinutes()).padStart(2, '0');

                const formattedTime = `${mo}월 ${da}일 ${ho}시 ${mi}분`;

                // Map status enum to Korean string
                let statusKo = "예정";
                if (match.status === "ONGOING") statusKo = "진행";
                else if (match.status === "FINISHED") statusKo = "종료";
                else if (match.status === "CANCELED") statusKo = "취소";

                return {
                    title: `${match.sportName} ${match.name || ''}`.trim(),
                    time: formattedTime,
                    status: statusKo,
                    teamA: `${match.teamA}반`,
                    teamB: `${match.teamB}반`,
                    location: match.location || '미정',
                    players: playersString || '선수 없음'
                };
            })
        );

        // 3. Return the mapped data
        return {
            user: {
                userId: userProfile.id,
                username: userProfile.username,
                studentNumber: userProfile.studentNumber,
                phoneNumber: userProfile.phoneNumber
            },
            classInfo: {
                classNumber,
                proctors: proctorsString,
                rosters: groupedRosters
            },
            schedules: formattedSchedules
        };
    } catch (e) {
        // Log the error internally and return a safe error state or 500 error
        console.error("Dashboard Load Error:", e);
        throw error(500, '데이터를 불러오는 중 오류가 발생했습니다.');
    }
};
