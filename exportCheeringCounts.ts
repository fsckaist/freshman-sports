import 'dotenv/config';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { and, eq, isNotNull } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './src/lib/server/db/schema';

declare const process: {
    argv: string[];
    env: Record<string, string | undefined>;
    exitCode?: number;
};

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const ROUND_ORDER: Record<string, number> = {
    R32: 1,
    R16: 2,
    QF: 3,
    SF: 4,
    GF: 5,
    BM: 6
};

function decodeKorean(value: string | null): string {
    if (!value) return '';

    try {
        const parsed = JSON.parse(value);
        return parsed.ko || parsed.en || value;
    } catch {
        return value;
    }
}

function getRoundLabel(round: number, positions: number[], matchName: string | null): string {
    const namePrefix = decodeKorean(matchName).match(/^(R32|R16|QF|SF|GF|BM)\b/i)?.[1]?.toUpperCase();
    if (namePrefix) return namePrefix;

    if (round === 5) {
        return positions.some(position => position >= 2) ? 'BM' : 'GF';
    }

    return ({ 1: 'R32', 2: 'R16', 3: 'QF', 4: 'SF' } as Record<number, string>)[round] || `R${round}`;
}

function escapeCsv(value: string | number): string {
    const text = String(value);
    return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function exportCheeringCounts() {
    const outputPath = resolve(process.argv[2] || 'cheering-counts.csv');

    const [classes, sports, finishedMatches, bracketNodes, cheeringRegisters] = await Promise.all([
        db.select().from(schema.classes),
        db.select().from(schema.sports),
        db.select().from(schema.matches).where(eq(schema.matches.status, 'FINISHED')),
        db.select({
            matchId: schema.tournament_brackets.matchId,
            round: schema.tournament_brackets.round,
            position: schema.tournament_brackets.position
        }).from(schema.tournament_brackets).where(isNotNull(schema.tournament_brackets.matchId)),
        db.select({
            scheduleId: schema.registers.scheduleId,
            classId: schema.registers.classId
        }).from(schema.registers).where(and(
            isNotNull(schema.registers.checkedInAt),
            eq(schema.registers.isCheering, true)
        ))
    ]);

    const sortedClasses = classes.sort((a, b) => a.classNumber - b.classNumber);
    const sportById = new Map(sports.map(sport => [sport.id, sport]));
    const bracketByMatchId = new Map<string, { round: number; positions: number[] }>();
    const cheeringByScheduleAndClass = new Map<string, number>();

    for (const node of bracketNodes) {
        if (!node.matchId) continue;

        const existing = bracketByMatchId.get(node.matchId);
        if (existing) {
            existing.positions.push(node.position);
        } else {
            bracketByMatchId.set(node.matchId, { round: node.round, positions: [node.position] });
        }
    }

    for (const register of cheeringRegisters) {
        const key = `${register.scheduleId}:${register.classId}`;
        cheeringByScheduleAndClass.set(key, (cheeringByScheduleAndClass.get(key) || 0) + 1);
    }

    const rows = new Map<string, {
        sportName: string;
        sportOrder: number;
        round: string;
        counts: Map<string, number>;
    }>();

    for (const match of finishedMatches) {
        if (!match.scheduleId || !match.classAId || !match.classBId) continue;

        const sport = sportById.get(match.sportId);
        const bracket = bracketByMatchId.get(match.id);
        if (!sport || !bracket) {
            console.warn(`경기 ${match.id}의 종목 또는 브래킷 정보를 찾지 못해 제외했습니다.`);
            continue;
        }

        const round = getRoundLabel(bracket.round, bracket.positions, match.name);
        const rowKey = `${sport.id}:${round}`;
        const row = rows.get(rowKey) || {
            sportName: decodeKorean(sport.name),
            sportOrder: sport.displayOrder,
            round,
            counts: new Map<string, number>()
        };

        for (const classId of [match.classAId, match.classBId]) {
            const count = cheeringByScheduleAndClass.get(`${match.scheduleId}:${classId}`) || 0;
            row.counts.set(classId, (row.counts.get(classId) || 0) + count);
        }

        rows.set(rowKey, row);
    }

    const sortedRows = [...rows.values()].sort((a, b) =>
        a.sportOrder - b.sportOrder ||
        (ROUND_ORDER[a.round] || Number.MAX_SAFE_INTEGER) - (ROUND_ORDER[b.round] || Number.MAX_SAFE_INTEGER) ||
        a.round.localeCompare(b.round)
    );

    const csvRows: (string | number)[][] = [
        ['종목', '라운드', ...sortedClasses.map(item => `${item.classNumber}반`)],
        ...sortedRows.map(row => [
            row.sportName,
            row.round,
            ...sortedClasses.map(item => row.counts.has(item.id) ? row.counts.get(item.id)! : '')
        ])
    ];

    const csv = csvRows.map(row => row.map(escapeCsv).join(',')).join('\r\n');
    await writeFile(outputPath, `\uFEFF${csv}`, 'utf8');

    console.log(`${finishedMatches.length}개의 종료된 경기를 조회했습니다.`);
    console.log(`${sortedRows.length}개 종목/라운드 행을 ${outputPath}에 저장했습니다.`);
}

exportCheeringCounts()
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => client.end());
