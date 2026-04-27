import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { matches } from '$lib/server/db/schema';
import { eq, isNull, and, isNotNull } from 'drizzle-orm';
import { propagateByeWindow } from '$lib/server/scheduleWindowHelper';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
    try {
        console.log("🔍 일정이 없는 기권승 매치를 찾는 중...");

        const stuckMatches = await db.query.matches.findMany({
            where: (m, { eq, and, isNull, isNotNull }) => and(
                eq(m.status, 'FINISHED'),
                eq(m.isVerified, true),
                isNotNull(m.winnerClassId),
                isNull(m.scheduledAt)
            )
        });

        console.log(`총 ${stuckMatches.length}개의 고장난(일정 없는) 기권승 매치를 발견했습니다.`);

        const results = [];
        for (const match of stuckMatches) {
            console.log(`\n▶ 매치 ID [${match.id}] (종목: ${match.sportId}) 복구 시작...`);
            try {
                await propagateByeWindow(match.id);
                console.log(`✅ 매치 ID [${match.id}] 복구 완료!`);
                results.push({ id: match.id, status: 'success' });
            } catch (error: any) {
                console.error(`❌ 매치 ID [${match.id}] 복구 실패:`, error);
                results.push({ id: match.id, status: 'error', error: error.message });
            }
        }

        return json({ success: true, count: stuckMatches.length, results });
    } catch (e: any) {
        return json({ success: false, error: e.message }, { status: 500 });
    }
};
