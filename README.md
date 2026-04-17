# Freshman Sports Management System

KAIST Freshman Sports (새내기 체육대회) 등의 스포츠 매치 스케줄링 및 경기 운영을 관리하기 위한 웹 애플리케이션입니다.

## 🛠 Tech Stack
- **Framework**: SvelteKit (Svelte 5)
- **Frontend**: TailwindCSS v4
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: SPARCS SSO 통합 지원
- **Deployment**: Node.js (via `@sveltejs/adapter-node`), PM2

---

## 🏃‍♀️ 서버 구축 (Getting Started)

### 1. 사전 요구사항
- Node.js 패키지 환경
- PostgreSQL 데이터베이스 가동 중이어야 함

### 2. 패키지 설치
```bash
pnpm install
```

### 3. 환경 변수 세팅 (`.env`)
프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 아래 데이터를 본인 환경에 맞춰 알맞게 변경하여 삽입합니다.
아래 값들이 정의되어야만 정상 구동됩니다.
```env
# PostgreSQL 인스턴스 연결 URL 세팅
DATABASE_URL="postgresql://username:password@127.0.0.1:5432/freshman_sports"

# SPARCS SSO 인증 설정
SSO_CLIENT_ID="발급받은_SSO_Client_ID"
SSO_SECRET_KEY="발급받은_SSO_Secret_Key"
SSO_IS_BETA="false"
USE_SPARCS_SSO="true" # false : 학번 로그인 (디버깅용), true : SPARCS SSO 사용

# JWT
JWT_SECRET="발급받은_JWT_Secret"

# DB SETTING
IS_DEMO="true" # true : 데모 모드, false : 실제 DB 사용 (사용하는 csv파일명이 다름)
DB_LOCK="false" # true : DB 잠금, false : DB 잠금 해제 (코드를 통한 DB 초기화 가능 여부)
```

---

## 💻 실행 및 배포 가이드 (Run & Deployment)

### 로컬 개발 모드 실행
코드 수정 및 즉각적인 반영, UI/API 확인 시 사용합니다.
```bash
pnpm dev
```

### 프로덕션 빌드 및 라이브 배포
이 프로젝트는 Vercel 등이 아닌 독자적인 내부 서버 호스팅을 위해 Node 어댑터 환경으로 빌드됩니다. 런타임 안정성과 백그라운드 운용을 위해 `pm2`를 사용합니다.
```bash
# 1. 사이트 빌드 (build/ 폴더에 결과물이 나옵니다)
pnpm build

# 2. PM2를 통한 데몬 스크립트 실행 (ecosystem.config.cjs를 참조함)
pm2 start ecosystem.config.cjs

# [참고사항] PM2 주요 명령어 목록
pm2 logs freshman-sports    # 서버 에러 및 콘솔 로그 실시간 확인
pm2 restart freshman-sports # 변경사항 반영 시 재시작할 때 사용
pm2 stop freshman-sports    # 가동 중인 서버 일시정지
```

---

## 🔧 주요 관리 도구 및 스크립트 (Management Scripts)

관리자 및 개발자가 데이터 이상이나 꼬임을 체크할 수 있도록 돕는 유틸리티 목록입니다.

### 데이터베이스 무결성 검사기 (checkIntegrity.ts)
경기 일정에 맞춰 관리자가 수동으로 심판/매니저를 배정하다 보면 피치 못한 실수가 발생할 수 있습니다. 이를 자동으로 찾아내는 스크립트입니다.
- **검사 조건 1**: 같은 시간대에 개최되는(Schedule ID가 겹치는) 두 개 이상의 경기에 한 사람(매니저/심판)이 중복 배정되지 않았는지.
- **검사 조건 2**: 각 심판과 매니저가 소속된 본인 반의 경기 운영에 개입하도록 모순되게 배정되지 않았는지.

**실행 방법**:
프로젝트 루트에서 다음과 같이 실행하면 콘솔에서 에러 현황을 리포트해줍니다.
```bash
npx tsx checkIntegrity.ts
```

### DB 스키마 업데이트
`src/lib/server/db/schema.ts` 수정 등 기존 Database의 모델 변경사항이 있을 경우에는 Drizzle 명령어를 이용해 물리적 DB에 푸시합니다.
```bash
npx drizzle-kit push
```

---

## 📁 주요 폴더 구조
- `src/routes/`: SvelteKit 기반 뷰 페이지 및 서버 엔드포인트(`+page.server.ts` 포함) 
- `src/lib/server/db/`: DB 스키마(`schema.ts`) 및 커넥션 스크립트(`index.ts`)
- `ecosystem.config.cjs`: PM2 서버 운영 파라미터 파일
- `checkIntegrity.ts`: 무결성 검사용 유닛 스크립트
