import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { matches, schedules, sports, classes, registers, rosters, users } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { RequestHandler } from './$types';

const classA = alias(classes, 'classA');
const classB = alias(classes, 'classB');
const referee = alias(users, 'referee');
const manager = alias(users, 'manager');

export const GET: RequestHandler = async ({ params, locals }) => {
    const user = locals.user;
    if (!user || (!user.isManager && !user.isAdmin)) {
        throw error(403, 'Permission denied');
    }

    const { matchId } = params;
    if (!matchId) {
        throw error(400, 'Missing matchId');
    }

    const activeMatch = await db
        .select({
            id: matches.id,
            scheduleId: matches.scheduleId,
            sportId: matches.sportId,
            classAId: matches.classAId,
            classBId: matches.classBId,
            status: matches.status,
            scoreA: matches.scoreA,
            scoreB: matches.scoreB,
            classA: classA.classNumber,
            classB: classB.classNumber,
            minPlayers: sports.minPlayers,
            refereeName: referee.name,
            refereePhone: referee.phoneNumber,
            managerName: manager.name,
            matchNotes: matches.matchNotes,
            recordStructure: sports.recordStructure,
            isVerified: matches.isVerified
        })
        .from(matches)
        .innerJoin(sports, eq(matches.sportId, sports.id))
        .leftJoin(classA, eq(matches.classAId, classA.id))
        .leftJoin(classB, eq(matches.classBId, classB.id))
        .leftJoin(referee, eq(matches.refereeId, referee.id))
        .leftJoin(manager, eq(matches.managerId, manager.id))
        .where(eq(matches.id, matchId))
        .limit(1)
        .then(res => res[0]);

    if (!activeMatch || !activeMatch.scheduleId) {
        throw error(404, 'Match not found');
    }

    // Fetch rosters and registers in parallel
    const [teamARoster, teamBRoster, matchRegisters] = await Promise.all([
        db.select({ userId: rosters.userId })
            .from(rosters)
            .where(and(eq(rosters.classId, activeMatch.classAId!), eq(rosters.sportId, activeMatch.sportId!))),
        db.select({ userId: rosters.userId })
            .from(rosters)
            .where(and(eq(rosters.classId, activeMatch.classBId!), eq(rosters.sportId, activeMatch.sportId!))),
        db.select({
            registerId: registers.id,
            userId: users.id,
            name: users.name,
            studentNumber: users.studentNumber,
            classId: users.classId,
            checkedInAt: registers.checkedInAt,
            isCheering: registers.isCheering
        })
            .from(registers)
            .innerJoin(users, eq(registers.userId, users.id))
            .where(eq(registers.scheduleId, activeMatch.scheduleId!))
    ]);

    const teamAUserIds = new Set(teamARoster.map(r => r.userId));
    const teamBUserIds = new Set(teamBRoster.map(r => r.userId));

    const teamACheckedIn = [];
    const teamAOfflinePlanned = [];
    const teamBCheckedIn = [];
    const teamBOfflinePlanned = [];
    const cheeringA = [];
    const cheeringB = [];

    for (const reg of matchRegisters) {
        if (reg.checkedInAt) {
            if (reg.isCheering) {
                if (reg.classId === activeMatch.classAId) {
                    cheeringA.push(reg);
                } else if (reg.classId === activeMatch.classBId) {
                    cheeringB.push(reg);
                }
            } else if (teamAUserIds.has(reg.userId)) {
                teamACheckedIn.push(reg);
            } else if (teamBUserIds.has(reg.userId)) {
                teamBCheckedIn.push(reg);
            } else {
                if (reg.classId === activeMatch.classAId) {
                    cheeringA.push(reg);
                } else if (reg.classId === activeMatch.classBId) {
                    cheeringB.push(reg);
                }
            }
        } else {
            if (teamAUserIds.has(reg.userId)) {
                teamAOfflinePlanned.push(reg);
            } else if (teamBUserIds.has(reg.userId)) {
                teamBOfflinePlanned.push(reg);
            }
        }
    }

    return json({
        ...activeMatch,
        attendance: {
            teamATotal: activeMatch.minPlayers,
            teamBTotal: activeMatch.minPlayers,
            teamA: teamACheckedIn,
            teamB: teamBCheckedIn,
            cheeringA,
            cheeringB,
            plannedTeamA: teamAOfflinePlanned,
            plannedTeamB: teamBOfflinePlanned
        }
    });
};
