/**
 * This file has been split into 3 separate seed files:
 * 1. seed_1_setup.ts (기본 설정)
 * 2. seed_2_users.ts (csv 기반 user 및 class 테이블 설정)
 * 3. seed_3_brackets.ts (csv 및 class 테이블 기반 seed bracket 생성)
 * 
 * You can run them sequentially:
 * npx tsx src/lib/server/db/seed_1_setup.ts
 * npx tsx src/lib/server/db/seed_2_users.ts
 * npx tsx src/lib/server/db/seed_3_brackets.ts
 */

import 'dotenv/config';
import { execSync } from 'child_process';
import path from 'path';

// DB_LOCK 체크: true이면 DB 세팅 스크립트 실행을 차단
if (process.env.DB_LOCK === 'true') {
    console.error("❌ DB_LOCK is enabled. Database seeding is blocked.");
    console.error("   Set DB_LOCK=false in .env to allow seeding.");
    process.exit(1);
}

console.log(" modularized seed scripts sequentially...");

try {
    console.log("\n==================================");
    console.log("Running 1. Basic Setup...");
    execSync('npx tsx src/lib/server/db/seed_1_setup.ts', { stdio: 'inherit', cwd: path.resolve(process.cwd()) });

    console.log("\n==================================");
    console.log("Running 2. Users & Classes Setup...");
    execSync('npx tsx src/lib/server/db/seed_2_users.ts', { stdio: 'inherit', cwd: path.resolve(process.cwd()) });

    console.log("\n==================================");
    console.log("Running 3. Brackets Setup...");
    execSync('npx tsx src/lib/server/db/seed_3_brackets.ts', { stdio: 'inherit', cwd: path.resolve(process.cwd()) });

    console.log("\n==================================");
    console.log("All seed scripts completed successfully!");
} catch (error) {
    console.error("Error running seed scripts sequentially.");
    process.exit(1);
}
