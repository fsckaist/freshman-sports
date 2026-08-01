# 파일 구조

## 루트

```text
.
├── README.md
├── docs/
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
├── drizzle.config.ts
├── ecosystem.config.cjs
├── checkIntegrity.ts
├── exportCheeringCounts.ts
├── res/
├── static/
└── src/
```

- `README.md`: 프로젝트의 짧은 개요와 상세 문서 링크입니다.
- `docs/`: 구축, 스키마, 스크립트, 구조 상세 문서입니다.
- `package.json`: SvelteKit 실행/빌드/검사 스크립트와 의존성입니다.
- `drizzle.config.ts`: drizzle-kit DB push 설정입니다.
- `ecosystem.config.cjs`: 과거 PM2 운영 실행 설정입니다. 현재 운영은 NSSM 서비스 `FreshmanSports` 기준입니다.
- `checkIntegrity.ts`: 경기 운영 인력 배정 무결성 검사 도구입니다.
- `exportCheeringCounts.ts`: 종료 경기의 응원 인원 CSV export 도구입니다.
- `static/`: 정적 파일입니다. favicon, logo, rulebook PDF가 들어 있습니다.
- `res/`: 원본 리소스성 파일입니다.

## `src`

```text
src
├── app.css
├── app.d.ts
├── app.html
├── hooks.server.ts
├── lib/
└── routes/
```

- `app.css`: Tailwind CSS v4 import, 폰트 theme, 다크 모드 variant, 기본 body/scrollbar 스타일입니다.
- `app.d.ts`: SvelteKit 타입 확장 위치입니다.
- `app.html`: HTML shell입니다.
- `hooks.server.ts`: JWT 세션 검증, 사용자 캐시, 온보딩/권한 리다이렉트, locale 설정을 담당합니다.

## `src/lib`

```text
src/lib
├── actions/
├── assets/
├── components/
├── server/
├── stores/
├── i18n.svelte.ts
├── theme.svelte.ts
└── toast.svelte.ts
```

- `i18n.svelte.ts`: KO/EN locale 관리와 JSON 문자열 decode helper입니다.
- `theme.svelte.ts`: 테마 상태 관리입니다.
- `toast.svelte.ts`: toast 상태 관리입니다.
- `actions/loading.ts`: form/action loading 보조 로직입니다.
- `assets/`: SvelteKit에서 import되는 asset입니다.
- `stores/`: 내비게이션 관련 store입니다.

## 컴포넌트

```text
src/lib/components
├── apply/
├── bracket/
├── dashboard/
├── layout/
├── record/
├── rules/
├── schedule/
└── ui/
```

- `apply/`: 종목 신청 카드 UI입니다.
- `bracket/`: 대진표 그리드, 연결선, 팀 노드 UI입니다.
- `dashboard/`: 프로필과 반 정보 카드입니다.
- `layout/`: 모바일 헤더와 사이드바입니다.
- `record/`: 매치 사이드바, 출석 추적, 경기 로그 패널입니다.
- `rules/`: 규칙 본문과 요약입니다.
- `schedule/`: 일정 카드, 일정 선택 grid, 시간 슬롯 카드입니다.
- `ui/`: 공통 toast 컨테이너입니다.

## 서버 유틸과 DB

```text
src/lib/server
├── db/
├── jwt.ts
├── scheduleWindowHelper.ts
├── sso.ts
└── timeUtils.ts
```

- `db/index.ts`: postgres client, Drizzle instance, DB mutation logger입니다.
- `db/schema.ts`: PostgreSQL 테이블과 enum 정의입니다.
- `db/seed*.ts`: DB 초기 데이터와 토너먼트 대진 생성 스크립트입니다.
- `jwt.ts`: JWT sign/verify helper입니다.
- `sso.ts`: SPARCS SSO V2 로그인 URL, token info, logout URL, KAIST 정보 파싱 로직입니다.
- `scheduleWindowHelper.ts`: 평일 기반 일정 window 계산과 schedule slot 자동 생성 로직입니다.
- `timeUtils.ts`: 남은 시간 label 생성 보조 함수입니다.

## 라우트 구조

SvelteKit route group인 `(app)`, `(auth)`, `(info)`는 URL에는 포함되지 않습니다.

```text
src/routes
├── (app)/
├── (auth)/
├── (info)/
├── api/
├── logout/
├── unauthorized/
├── +layout.*
└── +error.svelte
```

### `(app)`

- `/`: 로그인 후 대시보드입니다.
- `/apply`: 행사 상태가 `REGISTRATION`일 때 종목 신청/취소를 처리합니다.
- `/schedule`: 행사 상태가 `ONGOING`일 때 경기 일정 후보 투표를 처리합니다.
- `/bracket`: 행사 상태가 `ONGOING`일 때 종목별 대진표를 보여줍니다.
- `/record`: 매니저/관리자 전용 경기 기록 화면입니다.
- `/admin`: 관리자 전용 운영 콘솔입니다.
- `/rules`: 참가 규칙 화면입니다.
- `/referee-notice`: 독립 심판 계정 안내 화면입니다.

### `(auth)`

- `/login`: 로그인 화면과 개발용 학번 로그인 action입니다.
- `/login/sso`: SPARCS SSO 로그인 시작 endpoint입니다.
- `/login/callback`: SPARCS SSO callback endpoint입니다.
- `/register/gender`: 성별 정보 보완 단계입니다.
- `/register/rules`: 규칙 동의 단계입니다.
- `/register/privacy`: 개인정보 동의 단계입니다.
- `/info/rules`, `/info/privacy`: 온보딩 중 접근 가능한 안내 문서 화면입니다.

### `(info)`

- `/contact`: 문의 안내 화면입니다.
- `/privacy`: 공개 개인정보 처리 안내 화면입니다.

### API

- `GET /api/match/[matchId]/details`: 매니저/관리자용 경기 상세와 출석 현황 JSON을 반환합니다.
- `POST /api/match/[matchId]/save-notes`: 검증 전 경기의 점수와 메모를 저장합니다.

## 정적 파일

```text
static
├── aquila_futsal_rulebook.pdf
├── favicon.ico
├── logo.png
└── robots.txt
```

정적 파일은 SvelteKit에서 루트 경로(`/logo.png` 등)로 서빙됩니다.
