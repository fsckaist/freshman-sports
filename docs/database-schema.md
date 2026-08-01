# DB 스키마 설명

스키마는 [src/lib/server/db/schema.ts](../src/lib/server/db/schema.ts)에 Drizzle ORM으로 정의되어 있습니다. DB는 PostgreSQL을 사용합니다.

## Enum

- `match_status`: `PENDING_SCHEDULE`, `SCHEDULED`, `ONGOING`, `FINISHED`, `CANCELED`
- `bracket_status`: `win`, `lose`, `default`
- `gender`: `MALE`, `FEMALE`
- `gender_mode`: `MALE_ONLY`, `FEMALE_ONLY`, `MIXED`
- `event_state`: `REGISTRATION`, `ONGOING`, `COMPLETED`

## 테이블

### `classes`

반 정보를 저장합니다.

- `id`: UUID PK
- `class_number`: 반 번호, unique

### `sports`

종목 설정과 일정 생성 규칙을 저장합니다.

- `id`: UUID PK
- `name`: 종목명. 코드에서는 `{"ko":"풋살","en":"Futsal"}` 같은 JSON 문자열을 주로 사용합니다.
- `slug`: URL/CSV 매칭용 고유 slug
- `min_players`, `max_players`: 최소/최대 신청 인원
- `period_start`, `period_end`: 해당 종목의 전체 경기 기간
- `display_order`: 화면 표시 순서
- `required_gender`: 성별 제한
- `round1_selection_start`, `round1_selection_end`, `round1_deadline`: 1라운드 일정 투표 window 설정
- `daily_start_time`, `daily_end_time`, `time_slot_interval`, `max_parallel_matches`: 일정 슬롯 생성과 동시 경기 제한 설정
- `record_structure`: 경기 기록 화면에서 사용할 JSONB 구조

### `users`

로그인 대상 사용자와 역할 정보를 저장합니다.

- `id`: UUID PK
- `class_id`: 소속 반 FK, 심판/관리자 계정은 없을 수 있습니다.
- `auth_id`: SPARCS SSO uid, unique
- `email`: 이메일, unique
- `student_number`: 학번, unique
- `name`, `phone_number`, `gender`
- `is_proctor`, `is_manager`, `is_referee`, `is_admin`: 역할 플래그
- `agreed_privacy`, `agreed_rules`: 온보딩 동의 상태
- `created_at`

### `rosters`

사용자가 특정 종목에 출전 신청한 상태를 저장합니다.

- `id`: UUID PK
- `class_id`: 신청자의 반 FK
- `user_id`: 사용자 FK
- `sport_id`: 종목 FK
- unique: `(user_id, sport_id)`

한 사용자는 같은 종목에 한 번만 등록될 수 있습니다. 반별 최대 인원 제한은 애플리케이션 로직에서 검사합니다.

### `schedules`

종목별 가능한 시간 슬롯입니다.

- `id`: UUID PK
- `sport_id`: 종목 FK
- `start_time`: 슬롯 시작 시각
- `is_available`: 관리자에 의해 사용 가능/불가로 토글됩니다.

`ensureScheduleSlots`가 종목 기간과 일일 시간 설정에 맞춰 평일 슬롯을 생성합니다.

### `registers`

일정 투표와 현장 출석 정보를 함께 저장합니다.

- `id`: UUID PK
- `schedule_id`: 일정 슬롯 FK
- `user_id`: 사용자 FK
- `class_id`: 사용자 반 FK
- `is_available`: 해당 슬롯에 참여 가능하다는 투표 여부
- `checked_in_at`: 현장 출석 처리 시각
- `is_cheering`: 선수 출석이 아닌 응원 인원 출석인지 여부

일정 투표 단계에서는 `checked_in_at` 없이 row가 생성됩니다. 현장 등록 단계에서는 같은 row가 갱신되거나 새 row가 생성됩니다.

### `matches`

실제 경기 단위입니다.

- `id`: UUID PK
- `schedule_id`: 확정된 일정 슬롯 FK, 조율 전에는 null일 수 있습니다.
- `sport_id`: 종목 FK
- `class_a_id`, `class_b_id`: 경기 참가 반 FK
- `winner_class_id`: 승리 반 FK, 동시 탈락/미정이면 null일 수 있습니다.
- `referee_id`, `manager_id`: 운영 인력 FK
- `name`: `R32-M1`, `QF-M2` 같은 경기명 JSON 문자열
- `location`: 장소명 JSON 문자열 또는 텍스트
- `status`: 경기 상태
- `is_verified`: 관리자 검증 여부
- `score_a`, `score_b`
- `match_notes`: 경기 메모. 일부 로직에서는 JSON 문자열을 저장합니다.
- `scheduled_at`: 실제 확정 경기 시각
- `schedule_window_start`, `schedule_window_end`, `schedule_window_deadline`: 다음 투표 window

### `tournament_brackets`

토너먼트 트리의 각 슬롯을 저장합니다.

- `id`: UUID PK
- `sport_id`: 종목 FK
- `round`: 라운드 번호
- `position`: 라운드 내 슬롯 위치
- `class_id`: 해당 슬롯에 들어간 반 FK
- `match_id`: 이 슬롯이 속한 경기 FK
- `is_eliminated_slot`: 부전승/빈 슬롯/탈락 슬롯 여부
- `status`: 표시 상태(`win`, `lose`, `default`)

현재 시드 기준으로 각 종목은 32강 슬롯을 시작점으로 만들고, 6라운드에는 최종 1/2/3위 결과 슬롯을 둡니다.

### `system_config`

행사 전역 설정입니다.

- `id`: UUID PK
- `event_state`: 행사 상태
- `registration_deadline`: 종목 신청 마감 시각
- `updated_at`

### `sport_locations`

종목별 장소 후보입니다.

- `id`: UUID PK
- `sport_id`: 종목 FK
- `name`: 장소명. 보통 KO/EN JSON 문자열입니다.

## 주요 관계

- `classes` 1:N `users`
- `classes` 1:N `rosters`
- `sports` 1:N `rosters`, `schedules`, `matches`, `tournament_brackets`, `sport_locations`
- `schedules` 1:N `registers`
- `schedules` 1:N `matches`
- `matches` 1:N `tournament_brackets`
- `users`는 `matches.referee_id`, `matches.manager_id`, `registers.user_id`, `rosters.user_id`에서 참조됩니다.

## 데이터 흐름 메모

- 신청 정보는 `rosters`에 저장됩니다.
- 일정 후보 투표는 `registers`에 저장됩니다.
- 관리자가 일정을 확정하면 `matches.schedule_id`, `matches.scheduled_at`, `location`, `referee_id`, `manager_id`, `status`가 갱신됩니다.
- 현장 출석은 `registers.checked_in_at`과 `is_cheering`으로 구분합니다.
- 경기 결과 검증은 `matches.winner_class_id`, `is_verified`, `tournament_brackets.status`, 다음 라운드 `class_id`를 갱신합니다.
