# Freshman Sports Management System

KAIST 새내기 체육대회 운영을 위한 SvelteKit 기반 웹 애플리케이션입니다. 참가자 명단 관리, 종목 신청, 경기 일정 투표, 토너먼트 대진표, 현장 출석/기록, 관리자 경기 확정 및 결과 반영 흐름을 하나의 서비스에서 다룹니다.

## 주요 기능

- SPARCS SSO 또는 개발용 학번 로그인
- 성별/약관/개인정보 동의 온보딩
- 반별 종목 신청 및 신청 취소
- 경기별 일정 후보 투표와 출석 예정자 집계
- 토너먼트 대진표 조회 및 관리자용 결과 반영
- 매니저/관리자용 QR/학번 기반 선수 및 응원 인원 출석 기록
- 관리자용 경기 시간, 장소, 심판, 매니저, 행사 상태, 참가 명단 관리

## 기술 스택

- SvelteKit 2, Svelte 5, TypeScript
- Vite, Tailwind CSS v4
- PostgreSQL, Drizzle ORM, drizzle-kit
- JWT 세션 쿠키, SPARCS SSO V2 연동
- Node adapter, NSSM Windows 서비스 배포

## 빠른 시작

```bash
pnpm install
pnpm exec drizzle-kit push
pnpm exec tsx src/lib/server/db/seed.ts
pnpm dev
```

실행 전에 루트에 `.env` 파일을 만들고 `DATABASE_URL`, `JWT_SECRET`, SSO 관련 환경 변수를 설정해야 합니다. 시드 입력은 이 레포지토리와 별도로 관리되는 상위 경로의 `../data`에서 읽습니다. 즉, 이 레포지토리와 `data` 폴더는 나란히 있어야 하며, 시드 스크립트는 `../data/user.csv`, `../data/user_demo.csv`, `../data/bracket.csv`, `../data/bracket_demo.csv`를 사용합니다. 형식 예시는 [examples/seed-data](./examples/seed-data)에 포함되어 있습니다.

## 상세 문서

- [프로젝트 개요와 동작 구조](./docs/project-guide.md): 사용자 역할, 주요 화면, 인증/권한, 경기 운영 흐름 설명
- [구축 및 실행 방법](./docs/setup-and-running.md): 환경 변수, DB 준비, 시드, 개발 서버, 빌드, NSSM 서비스 실행 방법
- [DB 스키마 설명](./docs/database-schema.md): Drizzle 스키마 기준 테이블, enum, 관계, 주요 데이터 흐름
- [도구 스크립트 설명](./docs/scripts-and-tools.md): package scripts, DB 시드, 무결성 검사, 응원 집계 CSV export
- [파일 구조](./docs/file-structure.md): 루트 파일, `src/routes`, `src/lib`, 컴포넌트 구조 안내

## 참고

현재 앱은 행사 상태(`REGISTRATION`, `ONGOING`, `COMPLETED`)에 따라 신청, 일정 투표, 대진표 화면 접근을 제어합니다. 운영 전에는 관리자 화면에서 행사 상태와 종목별 일정 기간을 확인하세요.
