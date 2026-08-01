# 프로젝트 개요와 동작 구조

## 목적

이 프로젝트는 KAIST 새내기 체육대회처럼 여러 반이 여러 종목에서 토너먼트 경기를 치르는 행사를 운영하기 위한 웹 애플리케이션입니다. 참가자는 종목에 신청하고 경기 가능 시간을 투표하며, 운영진은 투표 결과를 바탕으로 경기 일정을 확정하고 현장 출석과 경기 결과를 관리합니다.

## 사용자 역할

- 일반 참가자: 소속 반이 있는 사용자입니다. 종목 신청, 일정 투표, 본인 반 경기 일정 및 대진표 조회를 수행합니다.
- 반 대표/감독 역할(`isProctor`): 소속 반 기준으로 참가 흐름에 접근할 수 있습니다.
- 심판(`isReferee`): 심판 권한만 있고 소속 반이 없는 경우 `/referee-notice`로 안내됩니다.
- 매니저(`isManager`): `/record`에서 경기 출석, 점수, 메모를 기록할 수 있습니다.
- 관리자(`isAdmin`): `/admin`에서 일정 슬롯, 경기 확정, 결과 검증, 사용자/명단/행사 설정을 관리합니다.

권한과 온보딩 검사는 [src/hooks.server.ts](../src/hooks.server.ts)에서 전역으로 처리합니다. 로그인하지 않은 사용자는 `/login` 또는 `/register/*` 계열을 제외하고 로그인 화면으로 이동합니다.

## 인증 흐름

앱은 JWT 기반 `session` 쿠키를 사용합니다. JWT에는 SSO uid/sid, 학번, DB 사용자 UUID가 들어가며 만료 기간은 7일입니다.

SPARCS SSO 사용 여부는 `USE_SPARCS_SSO`로 결정됩니다.

- `USE_SPARCS_SSO !== "false"`: SPARCS SSO V2를 사용합니다.
- `USE_SPARCS_SSO === "false"`: 개발용 학번 로그인 폼을 사용합니다.

SSO 콜백은 SSO에서 받은 KAIST 학적 정보를 파싱한 뒤 `users.studentNumber`와 매칭합니다. DB에 없는 학번은 로그인할 수 없습니다. 최초 SSO 로그인 시 `authId`, 이름, 이메일, 성별 정보를 사용자 레코드에 연결합니다.

주의: SvelteKit route group `(auth)`는 URL에 포함되지 않으므로 SSO 시작 라우트 파일은 `/login/sso`에 매핑됩니다. 현재 [src/routes/(auth)/login/+page.server.ts](../src/routes/(auth)/login/+page.server.ts)에는 `/auth/sso/login` 리다이렉트가 있어 실제 배포 전 동작 확인이 필요합니다.

## 행사 상태

행사 상태는 `system_config.eventState`에 저장되며 다음 세 값을 사용합니다.

- `REGISTRATION`: 참가자가 `/apply`에서 종목 신청/취소를 할 수 있습니다.
- `ONGOING`: 참가자가 `/schedule`, `/bracket`에서 일정 투표와 대진표 조회를 할 수 있습니다.
- `COMPLETED`: 행사 종료 상태입니다. 코드상 주요 참가자 화면은 기본 대시보드 중심으로 남습니다.

`system_config` row가 없으면 [src/routes/(app)/+layout.server.ts](../src/routes/(app)/+layout.server.ts)에서 기본 row를 생성합니다.

## 주요 화면

- `/`: 대시보드. 내 프로필, 신청 종목, 반 정보, 확정/조율 필요 경기 일정을 보여줍니다.
- `/apply`: 신청 기간에만 접근합니다. 종목별 현재 신청자, 최대 인원, 성별 제한, 최소 인원 상태를 보여주고 신청/취소 액션을 처리합니다.
- `/schedule`: 진행 기간에만 접근합니다. 내 종목의 pending match가 있을 때 일정 후보 슬롯을 보여주고 투표를 토글합니다.
- `/bracket`: 진행 기간에만 접근합니다. `tournament_brackets`를 종목별, 라운드별로 묶어 토너먼트 대진표에 전달합니다.
- `/record`: 매니저/관리자 전용입니다. 경기 목록, 출석 예정/완료 인원, 응원 인원, 점수와 경기 메모를 관리합니다.
- `/admin`: 관리자 전용입니다. 일정 슬롯 설정, 경기 확정, 결과 검증, 유저/로스터 관리, 행사 상태 설정, 임퍼소네이션을 포함합니다.

## 경기 운영 흐름

1. DB 시드로 종목, 반, 사용자, 32-slot 토너먼트 브래킷과 1라운드 경기(`PENDING_SCHEDULE`)를 생성합니다.
2. `REGISTRATION` 상태에서 참가자가 종목별 로스터에 등록합니다.
3. 관리자가 행사 상태를 `ONGOING`으로 바꾸고 종목별 기간/일정 후보 설정을 확인합니다.
4. 참가자는 `/schedule`에서 본인 종목의 pending match 일정 후보에 투표합니다.
5. 관리자는 `/admin?tab=confirm`에서 시간, 장소, 심판, 매니저를 배정하고 경기를 `SCHEDULED`로 확정합니다.
6. 매니저는 `/record`에서 선수/응원 인원을 출석 처리하고 경기를 `ONGOING`, 이후 `FINISHED`로 기록합니다.
7. 관리자는 결과를 검증하여 승자/패자를 대진표 다음 라운드로 반영합니다.
8. 다음 라운드 일정 조율 window는 [src/lib/server/scheduleWindowHelper.ts](../src/lib/server/scheduleWindowHelper.ts)의 헬퍼가 경기 종료 시점과 평일 규칙을 바탕으로 계산합니다.

## 일정 window 계산

`computeOrUpdateNextMatchWindow`는 완료된 feeder match를 기준으로 다음 경기를 위한 투표 기간을 계산합니다.

- feeder 경기 종료 시각 중 더 늦은 값을 기준으로 합니다.
- 마감은 그 다음 평일 18:00입니다.
- 투표 가능 날짜 시작은 마감일로부터 4영업일 뒤입니다.
- 종료는 시작일로부터 4영업일 뒤 23:59:59입니다.
- `ensureScheduleSlots`가 종목별 `dailyStartTime`, `dailyEndTime`, `timeSlotInterval`에 맞춰 평일 슬롯을 생성합니다.

## 다국어 처리

UI 언어는 `ko`와 `en`을 지원합니다. [src/lib/i18n.svelte.ts](../src/lib/i18n.svelte.ts)는 locale을 Svelte context, localStorage, `locale` 쿠키에 동기화합니다. DB의 `sports.name`, `matches.name`, 일부 메시지와 장소명은 `{"ko":"...", "en":"..."}` 형태의 JSON 문자열로 저장되고 클라이언트에서 decode합니다.
