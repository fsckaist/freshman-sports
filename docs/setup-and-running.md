# 구축 및 실행 방법

## 사전 준비

- Node.js와 pnpm이 필요합니다.
- PostgreSQL 인스턴스가 필요합니다.
- SPARCS SSO를 사용할 경우 SSO client id와 secret key가 필요합니다.
- DB 시드를 실행하려면 프로젝트 루트의 상위 폴더에 `data` 디렉터리와 CSV 파일이 필요합니다.

## 패키지 설치

```bash
pnpm install
```

## 환경 변수

루트에 `.env` 파일을 만들고 아래 값을 환경에 맞게 설정합니다.

```env
DATABASE_URL="postgresql://username:password@127.0.0.1:5432/freshman_sports"

SSO_CLIENT_ID="SPARCS_SSO_CLIENT_ID"
SSO_SECRET_KEY="SPARCS_SSO_SECRET_KEY"
SSO_IS_BETA="false"
USE_SPARCS_SSO="true"

JWT_SECRET="long-random-secret"

IS_DEMO="true"
DB_LOCK="false"
```

환경 변수 설명:

- `DATABASE_URL`: PostgreSQL 연결 URL입니다. 앱, drizzle-kit, 시드/도구 스크립트가 사용합니다.
- `SSO_CLIENT_ID`, `SSO_SECRET_KEY`, `SSO_IS_BETA`: SPARCS SSO V2 클라이언트 설정입니다.
- `USE_SPARCS_SSO`: `false`이면 개발용 학번 로그인, 그 외 값이면 SSO 로그인을 사용합니다.
- `JWT_SECRET`: JWT 세션 쿠키 서명에 사용합니다.
- `IS_DEMO`: `true`이면 `../data/user_demo.csv`, `../data/bracket_demo.csv`를 사용합니다. 그 외에는 `user.csv`, `bracket.csv`를 사용합니다.
- `DB_LOCK`: `true`이면 DB 초기화/시드 스크립트 실행을 막습니다.

주의: [src/lib/server/sso.ts](../src/lib/server/sso.ts)와 [src/lib/server/jwt.ts](../src/lib/server/jwt.ts)는 `$env/static/private`를 사용하므로 프로덕션 빌드 시점에도 관련 환경 변수가 필요합니다.

## DB 스키마 반영

Drizzle 스키마는 [src/lib/server/db/schema.ts](../src/lib/server/db/schema.ts)에 있습니다.

```bash
pnpm exec drizzle-kit push
```

[drizzle.config.ts](../drizzle.config.ts)는 `DATABASE_URL`이 없으면 `postgres://postgres:postgres@localhost:5432/postgres`를 fallback으로 사용합니다.

## 초기 데이터 시드

전체 초기화와 시드를 순차 실행하려면 다음 명령을 사용합니다.

```bash
pnpm exec tsx src/lib/server/db/seed.ts
```

이 명령은 내부적으로 아래 파일을 순서대로 실행합니다.

```bash
pnpm exec tsx src/lib/server/db/seed_1_setup.ts
pnpm exec tsx src/lib/server/db/seed_2_users.ts
pnpm exec tsx src/lib/server/db/seed_3_brackets.ts
```

시드 입력 CSV:

- `../data/user_demo.csv` 또는 `../data/user.csv`
- `../data/bracket_demo.csv` 또는 `../data/bracket.csv`

`seed_1_setup.ts`는 기존 핵심 테이블을 삭제한 뒤 기본 종목, 장소, 행사 설정을 넣습니다. 운영 DB에서 실행할 때는 `DB_LOCK=true`로 사고를 방지하세요.

## 개발 서버 실행

```bash
pnpm dev
```

네트워크의 다른 기기에서 접근해야 하면 Vite 옵션을 함께 넘깁니다.

```bash
pnpm dev -- --host 0.0.0.0
```

## 타입/정적 검사

```bash
pnpm check
```

watch 모드는 다음 명령을 사용합니다.

```bash
pnpm check:watch
```

## 프로덕션 빌드

```bash
pnpm build
```

현재 [svelte.config.js](../svelte.config.js)는 `@sveltejs/adapter-node`를 사용하므로 빌드 결과는 Node 서버로 실행됩니다.

로컬에서 빌드 결과를 확인하려면:

```bash
pnpm preview
```

## NSSM 서비스 실행

현재 운영 방식은 PM2가 아니라 NSSM(Non-Sucking Service Manager)으로 Node 서버를 Windows 서비스에 등록해 실행하는 방식입니다. 등록된 서비스 이름은 현재 `FreshmanSports`입니다.

```bash
pnpm build
nssm start FreshmanSports
```

운영 중 자주 쓰는 명령:

```bash
nssm status FreshmanSports
nssm restart FreshmanSports
nssm stop FreshmanSports
```

서비스 설정을 확인하거나 수정하려면 다음 명령을 사용합니다.

```bash
nssm edit FreshmanSports
```

서비스의 실행 대상은 빌드 결과인 `build/index.js`를 실행하는 Node 프로세스여야 합니다. `.env` 로딩 방식은 NSSM에 등록된 실행 명령/인자/환경 변수 설정을 기준으로 확인하세요.
