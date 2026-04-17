<script lang="ts">
    import { loadingEnhance } from '$lib/actions/loading';
    import { i18n } from "$lib/i18n.svelte";

    let {
        eventState = "REGISTRATION",
        sports = [],
        registrationDeadline = null,
        activeSportId = "",
    }: {
        eventState?: "REGISTRATION" | "ONGOING" | "COMPLETED";
        sports?: Array<{
            id: string;
            name: string;
            periodStart: string | Date | null;
            periodEnd: string | Date | null;
            round1SelectionStart: string | Date | null;
            round1SelectionEnd: string | Date | null;
            round1Deadline: string | Date | null;
            dailyStartTime: string | null;
            dailyEndTime: string | null;
            timeSlotInterval: number | null;
            maxParallelMatches: number | null;
            requiredGender: "MALE_ONLY" | "FEMALE_ONLY" | "MIXED";
            locations: Array<{ id: string; name: string }>;
        }>;
        registrationDeadline?: string | Date | null;
        activeSportId?: string;
    } = $props();

    let isUpdating = $state(false);
    let isDeadlineUpdating = $state(false);
    let localRegistrationDeadline = $state("");
    let isScheduleUpdating: Record<string, boolean> = $state({});
    let currentState = $derived(eventState);

    let activeSportTab = $state("");

    // Sync active sport tab if not set (especially on first load)
    $effect(() => {
        if (activeSportId) {
            activeSportTab = activeSportId;
        } else if (!activeSportTab && sports.length > 0) {
            activeSportTab = sports[0].id;
        }
    });

    // Convert Date or ISO string to datetime-local input value
    function toLocal(val: string | Date | null | undefined): string {
        if (!val) return "";
        const d = val instanceof Date ? val : new Date(val);
        if (isNaN(d.getTime())) return "";
        // Format as YYYY-MM-DDTHH:MM in local time
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    // Mutable form state per sport
    let sportForms: Record<
        string,
        {
            periodStart: string;
            periodEnd: string;
            selStart: string;
            selEnd: string;
            deadline: string;
            dailyStartTime: string;
            dailyEndTime: string;
            timeSlotInterval: number;
            maxParallelMatches: number;
            requiredGender: "MALE_ONLY" | "FEMALE_ONLY" | "MIXED";
        }
    > = $state({});

    // Keep internal form state in sync with props, especially after server updates
    let lastSportsHash = "";
    $effect(() => {
        // Sync registration deadline
        localRegistrationDeadline = toLocal(registrationDeadline);

        // Only update sportForms if the sports prop itself has changed (e.g. from server)
        // This prevents overwriting user input while they are typing.
        const currentHash = JSON.stringify(sports);
        if (currentHash !== lastSportsHash) {
            for (const s of sports) {
                // If the form state already exists, we might want to ONLY update if
                // it wasn't modified locally, but for an admin dashboard,
                // server and local state should usually sync after a successful save.
                sportForms[s.id] = {
                    periodStart: toLocal(s.periodStart),
                    periodEnd: toLocal(s.periodEnd),
                    selStart: toLocal(s.round1SelectionStart),
                    selEnd: toLocal(s.round1SelectionEnd),
                    deadline: toLocal(s.round1Deadline),
                    dailyStartTime: s.dailyStartTime || "10:00",
                    dailyEndTime: s.dailyEndTime || "16:00",
                    timeSlotInterval: s.timeSlotInterval || 60,
                    maxParallelMatches: s.maxParallelMatches || 1,
                    requiredGender: s.requiredGender || "MIXED",
                };
            }
            lastSportsHash = currentHash;
        }
    });

    const stateLabels = {
        REGISTRATION: i18n.t({ ko: "지원", en: "Registration" }),
        ONGOING: i18n.t({ ko: "진행", en: "Ongoing" }),
        COMPLETED: i18n.t({ ko: "종료", en: "Completed" }),
    };

    const stateOptions = [
        {
            value: "REGISTRATION",
            label: i18n.t({ ko: "지원 기간", en: "Registration Period" }),
            description: i18n.t({
                ko: "종목 지원만 가능합니다.",
                en: "Only sport registration is allowed.",
            }),
        },
        {
            value: "ONGOING",
            label: i18n.t({ ko: "진행 기간", en: "Ongoing Period" }),
            description: i18n.t({
                ko: "일정 정하기가 가능합니다.",
                en: "Schedule setting is allowed.",
            }),
        },
        {
            value: "COMPLETED",
            label: i18n.t({ ko: "종료", en: "Completed" }),
            description: i18n.t({
                ko: "대시보드만 볼 수 있습니다.",
                en: "Only dashboard is accessible.",
            }),
        },
    ];
</script>

<div
    class="flex flex-col bg-white dark:bg-zinc-900 rounded-[1.25rem] w-full flex-[1_0_0] relative overflow-hidden shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] dark:shadow-none h-full"
>
    <!-- Header -->
    <div
        class="flex items-center px-[1.875rem] py-4 shrink-0 border-b border-zinc-100 dark:border-zinc-800"
    >
        <div>
            <h2
                class="font-pretendard font-bold text-zinc-800 dark:text-zinc-100 text-[1.25rem] m-0"
            >
                {i18n.t({ ko: "시스템 설정", en: "System Settings" })}
            </h2>
            <p
                class="font-pretendard font-normal text-zinc-500 text-[0.875rem] m-0 mt-1"
            >
                {i18n.t({
                    ko: "체육대회의 세세한 설정을 조절할 수 있습니다. 반드시 총 관리자만 조작하십시오.",
                    en: "Adjust detailed settings for the sports event. Only the Super Admin should operate this.",
                })}
            </p>
        </div>
    </div>

    <!-- Content -->
    <div class="flex flex-col gap-8 p-[1.875rem] overflow-y-auto">
        <!-- State Switcher Card -->
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
                <h3
                    class="font-pretendard font-semibold text-zinc-800 dark:text-zinc-100 text-[1rem] m-0"
                >
                    {i18n.t({ ko: "체육대회 상태", en: "Event State" })}
                </h3>
                <p
                    class="font-pretendard font-normal text-zinc-600 dark:text-zinc-500 text-[0.8125rem] m-0"
                >
                    {i18n.t({ ko: "현재 상태:", en: "Current Status:" })}
                    <span class="font-semibold text-zinc-700 dark:text-zinc-600"
                        >{stateLabels[currentState]}</span
                    >
                </p>
            </div>

            <div class="flex gap-3 flex-wrap">
                {#each stateOptions as option}
                    <form
                        method="POST"
                        action="?/setEventState"
                        use:loadingEnhance={() => {
                            isUpdating = true;
                            return async ({ update }) => {
                                isUpdating = false;
                                update({ reset: false });
                            };
                        }}
                    >
                        <input
                            type="hidden"
                            name="eventState"
                            value={option.value}
                        />
                        <button
                            type="submit"
                            disabled={isUpdating ||
                                currentState === option.value}
                            class="flex flex-col gap-1.5 w-52 p-4 rounded-xl border-2 text-left transition-all cursor-pointer disabled:cursor-default
                            {currentState === option.value
                                ? 'border-zinc-800 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800'
                                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'}"
                        >
                            <div
                                class="flex items-center justify-between w-full"
                            >
                                <span
                                    class="font-pretendard font-bold text-[1rem]
                                    {currentState === option.value
                                        ? 'text-zinc-800 dark:text-zinc-100'
                                        : 'text-zinc-500 dark:text-zinc-600'}"
                                >
                                    {option.label}
                                </span>
                                {#if currentState === option.value}
                                    <div
                                        class="w-2.5 h-2.5 rounded-full bg-zinc-800 dark:bg-zinc-100 shrink-0"
                                    ></div>
                                {:else}
                                    <div
                                        class="w-2.5 h-2.5 rounded-full border-2 border-zinc-300 shrink-0"
                                    ></div>
                                {/if}
                            </div>
                            <p
                                class="font-pretendard font-normal text-zinc-600 dark:text-zinc-500 text-[0.75rem] m-0 leading-snug"
                            >
                                {option.description}
                            </p>
                        </button>
                    </form>
                {/each}
            </div>
        </div>

        <!-- Registration Deadline Card -->
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
                <h3
                    class="font-pretendard font-semibold text-zinc-800 dark:text-zinc-100 text-[1rem] m-0"
                >
                    {i18n.t({
                        ko: "종목 지원 마감 기한",
                        en: "Registration Deadline",
                    })}
                </h3>
                <p
                    class="font-pretendard font-normal text-zinc-600 dark:text-zinc-500 text-[0.8125rem] m-0"
                >
                    {i18n.t({
                        ko: "학생들이 종목에 지원할 수 있는 최종 기한을 설정합니다.",
                        en: "Set the final deadline for students to apply for sports.",
                    })}
                </p>
            </div>

            <form
                method="POST"
                action="?/setRegistrationDeadline"
                use:loadingEnhance={() => {
                    isDeadlineUpdating = true;
                    return async ({ update }) => {
                        isDeadlineUpdating = false;
                        update({ reset: false });
                    };
                }}
                class="flex gap-3 items-end"
            >
                <div class="flex flex-col gap-1.5">
                    <label
                        class="font-pretendard text-zinc-500 text-[0.75rem]"
                        for="reg-deadline"
                        >{i18n.t({ ko: "마감 일시", en: "Deadline" })}</label
                    >
                    <input
                        id="reg-deadline"
                        type="datetime-local"
                        name="registrationDeadline"
                        bind:value={localRegistrationDeadline}
                        class="font-pretendard text-[0.875rem] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:border-zinc-300 dark:focus:border-zinc-600 transition-colors text-zinc-800 dark:text-zinc-200"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isDeadlineUpdating}
                    class="font-pretendard font-medium text-[0.875rem] bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 active:bg-zinc-800 dark:active:bg-zinc-300 transition-colors disabled:opacity-50 h-[38px]"
                >
                    {isDeadlineUpdating
                        ? i18n.t({ ko: "저장 중...", en: "Saving..." })
                        : i18n.t({ ko: "저장하기", en: "Save" })}
                </button>
            </form>
        </div>

        <!-- Per-Sport Schedule Config -->
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
                <h3
                    class="font-pretendard font-semibold text-zinc-800 dark:text-zinc-100 text-[1rem] m-0"
                >
                    {i18n.t({
                        ko: "종목별 세부 설정",
                        en: "Per-Sport Detailed Settings",
                    })}
                </h3>
                <p
                    class="font-pretendard font-normal text-zinc-600 dark:text-zinc-500 text-[0.8125rem] m-0"
                >
                    {i18n.t({
                        ko: "종목별 전체 게임 기간 및 첫 라운드 일정 선택 기간과 마감 기한을 설정합니다.",
                        en: "Set the overall game period, round 1 selection period, and deadline for each sport.",
                    })}
                </p>
            </div>

            {#if sports.length === 0}
                <p class="font-pretendard text-zinc-600 text-[0.875rem]">
                    {i18n.t({
                        ko: "등록된 종목이 없습니다.",
                        en: "No sports registered.",
                    })}
                </p>
            {:else}
                <!-- Sport Tabs -->
                <div
                    class="flex gap-0 border-b border-zinc-200 dark:border-zinc-800"
                >
                    {#each sports as sport}
                        <a
                            href="?tab=settings&sportId={sport.id}"
                            class="font-pretendard text-[0.875rem] font-medium px-4 py-2.5 border-b-2 transition-colors no-underline
                            {activeSportTab === sport.id
                                ? 'border-zinc-800 dark:border-zinc-100 text-zinc-800 dark:text-zinc-100'
                                : 'border-transparent text-zinc-600 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-600'}"
                        >
                            {i18n.decode(sport.name)}
                        </a>
                    {/each}
                </div>

                {#each sports as sport}
                    {#if activeSportTab === sport.id && sportForms[sport.id]}
                        <form
                            method="POST"
                            action="?/setRound1Schedule"
                            use:loadingEnhance={({ action, cancel, formData }) => {
                                if (action.search.includes("addSportLocation")) {
                                    if (!formData.get("nameKo") || !formData.get("nameEn")) {
                                        alert(i18n.t({ ko: "한국어와 영어 장소명을 모두 입력해주세요.", en: "Please enter both Korean and English location names." }));
                                        cancel();
                                        return;
                                    }
                                }
                                isScheduleUpdating[sport.id] = true;
                                return async ({ update, result }) => {
                                    isScheduleUpdating[sport.id] = false;

                                    // Special handling for adding a location: clear the specific input
                                    if (
                                        action.search.includes(
                                            "addSportLocation",
                                        ) &&
                                        result.type === "success"
                                    ) {
                                        const koInput =
                                            document.getElementById(
                                                `new-loc-ko-${sport.id}`,
                                            ) as HTMLInputElement;
                                        const enInput =
                                            document.getElementById(
                                                `new-loc-en-${sport.id}`,
                                            ) as HTMLInputElement;
                                        if (koInput) koInput.value = "";
                                        if (enInput) enInput.value = "";

                                    }

                                    update({ reset: false });
                                };
                            }}
                            class="flex flex-col gap-8"
                        >
                            <input
                                type="hidden"
                                name="sportId"
                                value={sport.id}
                            />

                            <!-- Section 1: Venue Configuration -->
                            <div class="flex flex-col gap-4">
                                <p
                                    class="font-pretendard font-medium text-zinc-600 dark:text-zinc-600 text-[0.875rem] m-0"
                                >
                                    {i18n.t({
                                        ko: "경기장 개수 설정",
                                        en: "Venue Configuration",
                                    })}
                                </p>
                                <div class="grid grid-cols-3 gap-3">
                                    <div class="flex flex-col gap-1.5">
                                        <label
                                            class="font-pretendard text-zinc-500 text-[0.75rem]"
                                            for="d-parallel-{sport.id}"
                                            >{i18n.t({
                                                ko: "동시 경기 가능 수",
                                                en: "Max Parallel Matches",
                                            })}</label
                                        >
                                        <input
                                            id="d-parallel-{sport.id}"
                                            type="number"
                                            name="maxParallelMatches"
                                            min="1"
                                            bind:value={
                                                sportForms[sport.id]
                                                    .maxParallelMatches
                                            }
                                            class="font-pretendard text-[0.875rem] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:border-zinc-300 dark:focus:border-zinc-600 transition-colors text-zinc-800 dark:text-zinc-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr class="border-zinc-100 dark:border-zinc-800" />

                            <!-- Section 2: Location Management -->
                            <div class="flex flex-col gap-2">
                                <p
                                    class="font-pretendard font-medium text-zinc-600 dark:text-zinc-600 text-[0.875rem] m-0"
                                >
                                    {i18n.t({
                                        ko: "장소 관리",
                                        en: "Location Management",
                                    })}
                                </p>
                                <div
                                    class="flex flex-col gap-2 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-900/50"
                                >
                                    <div class="flex flex-wrap gap-2">
                                        {#if sport.locations && sport.locations.length > 0}
                                            {#each sport.locations as loc}
                                                <div
                                                    class="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg shadow-sm"
                                                >
                                                    <span
                                                        class="font-pretendard text-[0.875rem] text-zinc-700 dark:text-zinc-600"
                                                        >{i18n.decode(
                                                            loc.name,
                                                        )}</span
                                                    >
                                                    <button
                                                        type="submit"
                                                        name="locationId"
                                                        value={loc.id}
                                                        formaction="?/deleteSportLocation"
                                                        title={i18n.t({
                                                            ko: "삭제",
                                                            en: "Delete",
                                                        })}
                                                        class="text-zinc-600 hover:text-rose-500 transition-colors flex items-center justify-center p-0.5"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="14"
                                                            height="14"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            stroke-width="2"
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            ><path
                                                                d="M18 6 6 18"
                                                            /><path
                                                                d="m6 6 12 12"
                                                            /></svg
                                                        >
                                                    </button>
                                                </div>
                                            {/each}
                                        {:else}
                                            <p
                                                class="font-pretendard text-zinc-600 text-[0.8125rem] m-0"
                                            >
                                                {i18n.t({
                                                    ko: "등록된 장소가 없습니다.",
                                                    en: "No locations registered.",
                                                })}
                                            </p>
                                        {/if}
                                    </div>

                                    <div
                                        class="mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-800"
                                    >
                                        <div class="flex gap-2">
                                            <input
                                                id="new-loc-ko-{sport.id}"
                                                type="text"
                                                name="nameKo"
                                                placeholder={i18n.t({
                                                    ko: "한국어 장소명",
                                                    en: "Korean Name",
                                                })}
                                                class="flex-1 font-pretendard text-[0.875rem] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 bg-white dark:bg-zinc-800 focus:outline-none focus:border-zinc-300 dark:focus:border-zinc-600 transition-colors text-zinc-800 dark:text-zinc-200"
                                            />
                                            <input
                                                id="new-loc-en-{sport.id}"
                                                type="text"
                                                name="nameEn"
                                                placeholder={i18n.t({
                                                    ko: "영어 장소명",
                                                    en: "English Name",
                                                })}
                                                class="flex-1 font-pretendard text-[0.875rem] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 bg-white dark:bg-zinc-800 focus:outline-none focus:border-zinc-300 dark:focus:border-zinc-600 transition-colors text-zinc-800 dark:text-zinc-200"
                                            />
                                            <button
                                                type="submit"
                                                formaction="?/addSportLocation"
                                                class="font-pretendard font-medium text-[0.8125rem] bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                                            >
                                                {i18n.t({
                                                    ko: "추가",
                                                    en: "Add",
                                                })}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr class="border-zinc-100 dark:border-zinc-800" />

                            <!-- Section 3: Detailed Configurations -->
                            <div class="flex flex-col gap-5">
                                <div class="flex flex-col gap-2">
                                    <p
                                        class="font-pretendard font-medium text-zinc-600 dark:text-zinc-600 text-[0.875rem] m-0"
                                    >
                                        {i18n.t({
                                            ko: "성별 제한 설정",
                                            en: "Gender Restriction",
                                        })}
                                    </p>
                                    <div class="flex gap-4">
                                        {#each ["MALE_ONLY", "FEMALE_ONLY", "MIXED"] as gender}
                                            <label
                                                class="flex items-center gap-2 cursor-pointer group"
                                            >
                                                <input
                                                    type="radio"
                                                    name="requiredGender"
                                                    value={gender}
                                                    bind:group={
                                                        sportForms[sport.id]
                                                            .requiredGender
                                                    }
                                                    class="accent-zinc-800 dark:accent-zinc-100"
                                                />
                                                <span
                                                    class="font-pretendard text-[0.875rem] text-zinc-600 dark:text-zinc-600 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors"
                                                >
                                                    {gender === "MALE_ONLY"
                                                        ? i18n.t({
                                                              ko: "남성만",
                                                              en: "Male Only",
                                                          })
                                                        : gender ===
                                                            "FEMALE_ONLY"
                                                          ? i18n.t({
                                                                ko: "여성만",
                                                                en: "Female Only",
                                                            })
                                                          : i18n.t({
                                                                ko: "양성",
                                                                en: "Mixed",
                                                            })}
                                                </span>
                                            </label>
                                        {/each}
                                    </div>
                                </div>
                            </div>

                            <hr class="border-zinc-100 dark:border-zinc-800" />

                            <!-- Section 4: Duration Configurations-->
                            <div class="flex flex-col gap-5">
                                <div class="flex flex-col gap-2">
                                    <p
                                        class="font-pretendard font-medium text-zinc-600 dark:text-zinc-600 text-[0.875rem] m-0"
                                    >
                                        {i18n.t({
                                            ko: "시간 설정",
                                            en: "Time Settings",
                                        })}
                                    </p>
                                    <div class="grid grid-cols-3 gap-3">
                                        <div class="flex flex-col gap-1.5">
                                            <label
                                                class="font-pretendard text-zinc-500 text-[0.75rem]"
                                                for="d-start-{sport.id}"
                                                >{i18n.t({
                                                    ko: "매일 시작 시간",
                                                    en: "Daily Start Time",
                                                })}</label
                                            >
                                            <input
                                                id="d-start-{sport.id}"
                                                type="time"
                                                name="dailyStartTime"
                                                bind:value={
                                                    sportForms[sport.id]
                                                        .dailyStartTime
                                                }
                                                class="font-pretendard text-[0.875rem] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                                            />
                                        </div>
                                        <div class="flex flex-col gap-1.5">
                                            <label
                                                class="font-pretendard text-zinc-500 text-[0.75rem]"
                                                for="d-end-{sport.id}"
                                                >{i18n.t({
                                                    ko: "매일 종료 시간",
                                                    en: "Daily End Time",
                                                })}</label
                                            >
                                            <input
                                                id="d-end-{sport.id}"
                                                type="time"
                                                name="dailyEndTime"
                                                bind:value={
                                                    sportForms[sport.id]
                                                        .dailyEndTime
                                                }
                                                class="font-pretendard text-[0.875rem] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                                            />
                                        </div>
                                        <div class="flex flex-col gap-1.5">
                                            <label
                                                class="font-pretendard text-zinc-500 text-[0.75rem]"
                                                for="d-interval-{sport.id}"
                                                >{i18n.t({
                                                    ko: "간격 (분단위)",
                                                    en: "Interval (minutes)",
                                                })}</label
                                            >
                                            <input
                                                id="d-interval-{sport.id}"
                                                type="number"
                                                name="timeSlotInterval"
                                                step="5"
                                                bind:value={
                                                    sportForms[sport.id]
                                                        .timeSlotInterval
                                                }
                                                class="font-pretendard text-[0.875rem] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div class="flex flex-col gap-2">
                                    <p
                                        class="font-pretendard font-medium text-zinc-600 dark:text-zinc-600 text-[0.875rem] m-0"
                                    >
                                        {i18n.t({
                                            ko: "전체 게임 기간",
                                            en: "Overall Period",
                                        })}
                                    </p>
                                    <div class="grid grid-cols-2 gap-3">
                                        <div class="flex flex-col gap-1.5">
                                            <label
                                                class="font-pretendard text-zinc-500 text-[0.75rem]"
                                                for="p-start-{sport.id}"
                                                >{i18n.t({
                                                    ko: "시작",
                                                    en: "Start",
                                                })}</label
                                            >
                                            <input
                                                id="p-start-{sport.id}"
                                                type="datetime-local"
                                                name="periodStart"
                                                bind:value={
                                                    sportForms[sport.id]
                                                        .periodStart
                                                }
                                                class="font-pretendard text-[0.875rem] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                                            />
                                        </div>
                                        <div class="flex flex-col gap-1.5">
                                            <label
                                                class="font-pretendard text-zinc-500 text-[0.75rem]"
                                                for="p-end-{sport.id}"
                                                >{i18n.t({
                                                    ko: "종료",
                                                    en: "End",
                                                })}</label
                                            >
                                            <input
                                                id="p-end-{sport.id}"
                                                type="datetime-local"
                                                name="periodEnd"
                                                bind:value={
                                                    sportForms[sport.id]
                                                        .periodEnd
                                                }
                                                class="font-pretendard text-[0.875rem] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div class="flex flex-col gap-2">
                                    <p
                                        class="font-pretendard font-medium text-zinc-600 dark:text-zinc-600 text-[0.875rem] m-0"
                                    >
                                        {i18n.t({
                                            ko: "첫 라운드 일정 선택 기간",
                                            en: "Round 1 Selection Period",
                                        })}
                                    </p>
                                    <div class="grid grid-cols-3 gap-3">
                                        <div class="flex flex-col gap-1.5">
                                            <label
                                                class="font-pretendard text-zinc-500 text-[0.75rem]"
                                                for="s-start-{sport.id}"
                                                >{i18n.t({
                                                    ko: "시작일",
                                                    en: "Start Date",
                                                })}</label
                                            >
                                            <input
                                                id="s-start-{sport.id}"
                                                type="datetime-local"
                                                name="selectionStart"
                                                bind:value={
                                                    sportForms[sport.id]
                                                        .selStart
                                                }
                                                class="font-pretendard text-[0.875rem] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                                            />
                                        </div>
                                        <div class="flex flex-col gap-1.5">
                                            <label
                                                class="font-pretendard text-zinc-500 text-[0.75rem]"
                                                for="s-end-{sport.id}"
                                                >{i18n.t({
                                                    ko: "종료일",
                                                    en: "End Date",
                                                })}</label
                                            >
                                            <input
                                                id="s-end-{sport.id}"
                                                type="datetime-local"
                                                name="selectionEnd"
                                                bind:value={
                                                    sportForms[sport.id].selEnd
                                                }
                                                class="font-pretendard text-[0.875rem] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                                            />
                                        </div>
                                        <div class="flex flex-col gap-1.5">
                                            <label
                                                class="font-pretendard text-zinc-500 text-[0.75rem]"
                                                for="s-dl-{sport.id}"
                                                >{i18n.t({
                                                    ko: "마감일",
                                                    en: "Deadline",
                                                })}</label
                                            >
                                            <input
                                                id="s-dl-{sport.id}"
                                                type="datetime-local"
                                                name="deadline"
                                                bind:value={
                                                    sportForms[sport.id]
                                                        .deadline
                                                }
                                                class="font-pretendard text-[0.875rem] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div
                                    class="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800"
                                >
                                    <button
                                        type="submit"
                                        disabled={isScheduleUpdating[sport.id]}
                                        class="font-pretendard font-medium text-[0.875rem] bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 px-[1.5rem] py-2.5 rounded-xl hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all disabled:opacity-50"
                                    >
                                        {isScheduleUpdating[sport.id]
                                            ? i18n.t({
                                                  ko: "저장 중...",
                                                  en: "Saving...",
                                              })
                                            : i18n.t({
                                                  ko: "설정 저장하기",
                                                  en: "Save Settings",
                                              })}
                                    </button>
                                </div>
                            </div>
                        </form>
                    {/if}
                {/each}
            {/if}
        </div>
    </div>
</div>
