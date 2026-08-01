# 도구 스크립트 설명

## package scripts

[package.json](../package.json)에 정의된 스크립트입니다.

```bash
pnpm dev
pnpm build
pnpm preview
pnpm check
pnpm check:watch
```

- `dev`: Vite 개발 서버를 실행합니다.
- `build`: SvelteKit Node adapter 빌드를 생성합니다.
- `preview`: 빌드 결과를 로컬에서 미리 실행합니다.
- `prepare`: `svelte-kit sync`를 실행합니다.
- `check`: `svelte-kit sync` 후 `svelte-check`로 타입/컴포넌트 검사를 수행합니다.
- `check:watch`: `check`를 watch 모드로 실행합니다.

## Drizzle

스키마 변경을 DB에 반영합니다.

```bash
pnpm exec drizzle-kit push
```

설정 파일은 [drizzle.config.ts](../drizzle.config.ts)이며 스키마 입력은 `src/lib/server/db/schema.ts`, 출력 디렉터리는 `drizzle`입니다.

## DB 시드

### 전체 실행

```bash
pnpm exec tsx src/lib/server/db/seed.ts
```

[src/lib/server/db/seed.ts](../src/lib/server/db/seed.ts)는 아래 세 스크립트를 순서대로 실행하는 래퍼입니다.

### 1. 기본 설정

```bash
pnpm exec tsx src/lib/server/db/seed_1_setup.ts
```

[seed_1_setup.ts](../src/lib/server/db/seed_1_setup.ts)는 핵심 테이블을 삭제한 뒤 다음 데이터를 생성합니다.

- `system_config`: 기본 행사 상태 `REGISTRATION`
- `sports`: 풋살, 농구, 남자 배드민턴 복식, 여자 배드민턴 복식
- `sport_locations`: 종목별 기본 경기 장소
- 종목별 경기 기간, 1라운드 투표 기간, 일일 슬롯 생성 설정
- 종목별 `record_structure`

### 2. 사용자와 반

```bash
pnpm exec tsx src/lib/server/db/seed_2_users.ts
```

[seed_2_users.ts](../src/lib/server/db/seed_2_users.ts)는 1반부터 31반까지 생성하고 CSV에서 사용자를 읽어 넣습니다.

CSV 경로:

- `IS_DEMO=true`: `../data/user_demo.csv`
- 그 외: `../data/user.csv`

CSV 컬럼은 코드 기준으로 `class_number, student_number, name, phone_number, is_proctor, is_referee, is_manager, is_admin` 순서입니다.

같은 학번이 여러 줄에 있으면 역할 플래그를 병합합니다.

### 3. 대진과 1라운드 경기

```bash
pnpm exec tsx src/lib/server/db/seed_3_brackets.ts
```

[seed_3_brackets.ts](../src/lib/server/db/seed_3_brackets.ts)는 CSV 행렬을 읽어 종목별 32강 대진 슬롯과 1라운드 `PENDING_SCHEDULE` 경기를 만듭니다.

CSV 경로:

- `IS_DEMO=true`: `../data/bracket_demo.csv`
- 그 외: `../data/bracket.csv`

CSV header는 `sports.slug`와 매칭됩니다.

### 데모 토너먼트 시드

```bash
pnpm exec tsx src/lib/server/db/seedTournament.ts
```

[seedTournament.ts](../src/lib/server/db/seedTournament.ts)는 각 종목에 대해 31개 반과 1개 bye를 기반으로 임의 진행 상태가 섞인 토너먼트 브래킷을 생성합니다. 기존 `tournament_brackets`는 삭제하지만 `matches`까지 함께 구성하는 현재 운영 시드와 목적이 다릅니다. UI 대진표 테스트용에 가깝습니다.

## DB_LOCK

모든 시드 스크립트는 시작 시 `DB_LOCK`을 확인합니다.

- `DB_LOCK=true`: 실행 중단
- 그 외: 실행 허용

운영 DB에서는 실수로 데이터를 삭제하지 않도록 `.env`에 `DB_LOCK=true`를 두는 것을 권장합니다.

## 무결성 검사

```bash
pnpm exec tsx checkIntegrity.ts
```

[checkIntegrity.ts](../checkIntegrity.ts)는 배정된 경기 데이터를 검사합니다.

- 같은 시간대에 한 사람이 여러 경기의 심판/매니저로 중복 배정되었는지 확인합니다.
- 심판/매니저가 자기 반 경기에 배정되었는지 확인합니다.
- 같은 반이 같은 날짜에 두 경기 이상 배정되었는지 경고합니다.

주요 위반이 있으면 프로세스가 실패 코드로 종료됩니다.

## 응원 인원 CSV export

```bash
pnpm exec tsx exportCheeringCounts.ts
pnpm exec tsx exportCheeringCounts.ts output.csv
```

[exportCheeringCounts.ts](../exportCheeringCounts.ts)는 종료된 경기(`FINISHED`)를 대상으로 종목/라운드/반별 응원 출석 인원을 집계해 CSV로 저장합니다. 출력 파일을 지정하지 않으면 `cheering-counts.csv`를 생성합니다.

집계 기준:

- `registers.checked_in_at`이 null이 아닙니다.
- `registers.is_cheering = true`입니다.
- 경기의 `schedule_id`, `class_a_id`, `class_b_id`, 브래킷 라운드 정보가 있어야 합니다.

CSV는 Excel 호환을 위해 UTF-8 BOM을 포함합니다.

## 배포 보조 설정

현재 운영 배포는 NSSM Windows 서비스 기준입니다. 등록된 서비스 이름은 `FreshmanSports`입니다.

자주 쓰는 명령:

```bash
nssm status FreshmanSports
nssm restart FreshmanSports
nssm stop FreshmanSports
nssm edit FreshmanSports
```

[ecosystem.config.cjs](../ecosystem.config.cjs)는 PM2용 설정 파일이지만, 현재 운영 방식에서는 NSSM 서비스 설정이 우선입니다.
