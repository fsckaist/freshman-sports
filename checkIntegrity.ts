import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './src/lib/server/db/schema';
import { isNotNull, or } from 'drizzle-orm';

declare var process: any;

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function checkIntegrity() {
    console.log("=== 시작: 무결성 검사 ===");

    // 1. 모든 사용자와 경기 조회
    const allUsers = await db.select().from(schema.users);
    const usersMap = new Map();
    for (const u of allUsers) {
        usersMap.set(u.id, u);
    }

    const allSports = await db.select().from(schema.sports);
    const sportsMap = new Map();
    for (const s of allSports) {
        let sportName = s.name;
        try { sportName = JSON.parse(s.name || "{}").ko || s.name; } catch(e) {}
        sportsMap.set(s.id, sportName);
    }

    const allMatches = await db.select().from(schema.matches).where(
        or(isNotNull(schema.matches.refereeId), isNotNull(schema.matches.managerId))
    );

    // 조건 1: 각 심판과 매니저는 같은 시간대에 하나의 경기에만 참여해야 한다.
    const timeAssignments = new Map<number, Map<string, any[]>>();

    let violation1Count = 0;
    let violation2Count = 0;

    for (const match of allMatches) {
        if (!match.scheduledAt || match.status === 'CANCELED') continue;
        const timeKey = match.scheduledAt.getTime();

        const checkUserTimeOverlap = (userId: string, role: string) => {
            if (!timeAssignments.has(timeKey)) {
                timeAssignments.set(timeKey, new Map());
            }
            const timeSlotMap = timeAssignments.get(timeKey)!;

            if (!timeSlotMap.has(userId)) {
                timeSlotMap.set(userId, []);
            }
            timeSlotMap.get(userId)!.push({ matchId: match.id, role, matchName: match.name, sportName: sportsMap.get(match.sportId) });
        };

        const checkClassOverlap = (userId: string, role: string) => {
            const user = usersMap.get(userId);
            if (!user) return;

            // 사용자의 반이 존재하고(0반이나 교직원이 아니며), 해당 경기의 A반 또는 B반과 같을 때 위반
            if (user.classId && (user.classId === match.classAId || user.classId === match.classBId)) {
                let matchNameDisplay = match.id;
                try { matchNameDisplay = JSON.parse(match.name || "{}").ko || match.id; } catch (e) { }
                const sportName = sportsMap.get(match.sportId) || "알수없음";
                console.error(`[위반 2 - 자기 반 경기 배정] 이름: ${user.name}(${user.studentNumber}), 역할: ${role}, 경기: [${sportName}] ${matchNameDisplay}`);
                violation2Count++;
            }
        };

        if (match.refereeId) {
            checkUserTimeOverlap(match.refereeId, '심판');
            checkClassOverlap(match.refereeId, '심판');
        }

        if (match.managerId) {
            checkUserTimeOverlap(match.managerId, '매니저');
            checkClassOverlap(match.managerId, '매니저');
        }
    }

    // 클래스 정보 가져오기 (이름 출력을 위해)
    const allClasses = await db.select().from(schema.classes);
    const classesMap = new Map();
    for (const c of allClasses) {
        classesMap.set(c.id, c.classNumber);
    }

    // 시간 겹침 위반 출력
    for (const [timeKey, timeSlotMap] of timeAssignments.entries()) {
        const timeStr = new Date(timeKey).toLocaleString('ko-KR');
        for (const [userId, assignments] of timeSlotMap.entries()) {
            if (assignments.length > 1) {
                // 예외 허용: 동일한 하나의 경기에서 심판과 매니저를 둘 다 맡은 경우는 중복 배정 위반으로 보지 않음
                const isSameMatch = assignments.every((a: any) => a.matchId === assignments[0].matchId);
                if (isSameMatch) continue;

                const user = usersMap.get(userId);
                const matchNames = assignments.map((a: any) => {
                    let nameDisplay = a.matchId;
                    try { nameDisplay = JSON.parse(a.matchName || "{}").ko || a.matchId; } catch (e) { }
                    return `[${a.sportName || "알수없음"}] ${nameDisplay} (${a.role})`;
                }).join(", ");
                console.error(`[위반 1 - 동시간대 중복 배정] 이름: ${user?.name}(${user?.studentNumber}), 경기들: ${matchNames}, 공통 시간: ${timeStr}`);
                violation1Count++;
            }
        }
    }

    // 조건 3: 한 반이 같은 날에 두 가지 이상의 경기가 배정되었는지 체크
    const classDateAssignments = new Map<string, any[]>();
    let violation3Count = 0;

    const allScheduledMatches = await db.select().from(schema.matches);
    for (const match of allScheduledMatches) {
        if (!match.scheduledAt || match.status === 'CANCELED') continue;
        
        const dateObj = match.scheduledAt;
        // YYYY-MM-DD 형식으로 날짜 키 생성
        const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        
        const registerMatchForClass = (classId: string | null) => {
            if (!classId) return;
            const key = `${dateKey}_${classId}`;
            if (!classDateAssignments.has(key)) {
                classDateAssignments.set(key, []);
            }
            classDateAssignments.get(key)!.push({
                matchId: match.id,
                matchName: match.name,
                sportName: sportsMap.get(match.sportId)
            });
        };

        registerMatchForClass(match.classAId);
        registerMatchForClass(match.classBId);
    }

    for (const [key, matches] of classDateAssignments.entries()) {
        if (matches.length > 1) {
            const [dateStr, classId] = key.split('_');
            const classNumber = classesMap.get(classId) || "알수없음";
            
            const matchNames = matches.map((m: any) => {
                let nameDisplay = m.matchId;
                try { nameDisplay = JSON.parse(m.matchName || "{}").ko || m.matchId; } catch (e) { }
                return `[${m.sportName || "알수없음"}] ${nameDisplay}`;
            }).join(", ");
            
            console.error(`[위반 3 - 같은 날짜 중복 경기 배정] 반: ${classNumber}반, 날짜: ${dateStr}, 경기들: ${matchNames}`);
            violation3Count++;
        }
    }

    console.log(`\n=== 검사 종료 ===`);
    console.log(`조건 1 (동시간대 중복 배정): ${violation1Count}건 위반`);
    console.log(`조건 2 (자기 반 경기 배정): ${violation2Count}건 위반`);
    console.log(`조건 3 (하루 2경기 이상 배정된 반): ${violation3Count}건 위반`);

    if (violation1Count === 0 && violation2Count === 0 && violation3Count === 0) {
        console.log("✅ 모든 무결성 조건이 만족되었습니다!");
    } else {
        console.log("❌ 문제되는 경기 배정을 확인하고 수정하세요.");
    }

    process.exit(0);
}

checkIntegrity().catch(err => {
    console.error(err);
    process.exit(1);
});
