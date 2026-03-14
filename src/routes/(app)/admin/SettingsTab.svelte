<script lang="ts">
    import { enhance } from "$app/forms";

    let {
        eventState = "REGISTRATION",
        sports = [],
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
        }>;
    } = $props();

    let isUpdating = $state(false);
    let isScheduleUpdating: Record<string, boolean> = $state({});
    let currentState = $derived(eventState);

    let activeSportTab = $state("");

    // Sync active sport tab if not set (especially on first load)
    $effect(() => {
        if (!activeSportTab && sports.length > 0) {
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
        }
    > = $state({});

    // Keep internal form state in sync with props, especially after server updates
    let lastSportsHash = "";
    $effect(() => {
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
                };
            }
            lastSportsHash = currentHash;
        }
    });

    const stateLabels = {
        REGISTRATION: "지원",
        ONGOING: "진행",
        COMPLETED: "종료",
    };

    const stateOptions = [
        {
            value: "REGISTRATION",
            label: "지원 기간",
            description: "종목 지원만 가능합니다.",
        },
        {
            value: "ONGOING",
            label: "진행 기간",
            description: "일정 정하기가 가능합니다.",
        },
        {
            value: "COMPLETED",
            label: "종료",
            description: "대시보드만 볼 수 있습니다.",
        },
    ];
</script>

<div
    class="flex flex-col bg-white rounded-[1.25rem] w-full flex-[1_0_0] relative overflow-hidden shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] h-full"
>
    <!-- Header -->
    <div
        class="flex items-center px-[1.875rem] py-4 shrink-0 border-b border-zinc-100"
    >
        <div>
            <h2
                class="font-pretendard font-bold text-zinc-800 text-[1.25rem] m-0"
            >
                시스템 설정
            </h2>
            <p
                class="font-pretendard font-normal text-zinc-500 text-[0.875rem] m-0 mt-1"
            >
                체육대회의 세세한 설정을 조절할 수 있습니다. 반드시 총 관리자만
                조작하십시오.
            </p>
        </div>
    </div>

    <!-- Content -->
    <div class="flex flex-col gap-8 p-[1.875rem] overflow-y-auto">
        <!-- State Switcher Card -->
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
                <h3
                    class="font-pretendard font-semibold text-zinc-800 text-[1rem] m-0"
                >
                    체육대회 상태
                </h3>
                <p
                    class="font-pretendard font-normal text-zinc-400 text-[0.8125rem] m-0"
                >
                    현재 상태: <span class="font-semibold text-zinc-700"
                        >{stateLabels[currentState]}</span
                    >
                </p>
            </div>

            <div class="flex gap-3 flex-wrap">
                {#each stateOptions as option}
                    <form
                        method="POST"
                        action="?/setEventState"
                        use:enhance={() => {
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
                                ? 'border-zinc-800 bg-zinc-50'
                                : 'border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50'}"
                        >
                            <div
                                class="flex items-center justify-between w-full"
                            >
                                <span
                                    class="font-pretendard font-bold text-[1rem]
                                    {currentState === option.value
                                        ? 'text-zinc-800'
                                        : 'text-zinc-500'}"
                                >
                                    {option.label}
                                </span>
                                {#if currentState === option.value}
                                    <div
                                        class="w-2.5 h-2.5 rounded-full bg-zinc-800 shrink-0"
                                    ></div>
                                {:else}
                                    <div
                                        class="w-2.5 h-2.5 rounded-full border-2 border-zinc-300 shrink-0"
                                    ></div>
                                {/if}
                            </div>
                            <p
                                class="font-pretendard font-normal text-zinc-400 text-[0.75rem] m-0 leading-snug"
                            >
                                {option.description}
                            </p>
                        </button>
                    </form>
                {/each}
            </div>
        </div>

        <!-- Per-Sport Schedule Config -->
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
                <h3
                    class="font-pretendard font-semibold text-zinc-800 text-[1rem] m-0"
                >
                    종목별 세부 설정
                </h3>
                <p
                    class="font-pretendard font-normal text-zinc-400 text-[0.8125rem] m-0"
                >
                    종목별 전체 게임 기간 및 첫 라운드 일정 선택 기간과 마감
                    기한을 설정합니다.
                </p>
            </div>

            {#if sports.length === 0}
                <p class="font-pretendard text-zinc-400 text-[0.875rem]">
                    등록된 종목이 없습니다.
                </p>
            {:else}
                <!-- Sport Tabs -->
                <div class="flex gap-0 border-b border-zinc-200">
                    {#each sports as sport, i}
                        <button
                            type="button"
                            onclick={() => (activeSportTab = sport.id)}
                            class="font-pretendard text-[0.875rem] font-medium px-4 py-2.5 border-b-2 transition-colors
                            {activeSportTab === sport.id
                                ? 'border-zinc-800 text-zinc-800'
                                : 'border-transparent text-zinc-400 hover:text-zinc-600'}"
                        >
                            {sport.name}
                        </button>
                    {/each}
                </div>

                {#each sports as sport}
                    {#if activeSportTab === sport.id && sportForms[sport.id]}
                        <form
                            method="POST"
                            action="?/setRound1Schedule"
                            use:enhance={() => {
                                isScheduleUpdating[sport.id] = true;
                                return async ({ update }) => {
                                    isScheduleUpdating[sport.id] = false;
                                    update({ reset: false });
                                };
                            }}
                            class="flex flex-col gap-5"
                        >
                            <input
                                type="hidden"
                                name="sportId"
                                value={sport.id}
                            />

                            <p
                                class="font-pretendard font-medium text-zinc-600 text-[0.875rem] m-0"
                            >
                                경기장 개수 설정
                            </p>
                            <div class="grid grid-cols-3 gap-3">
                                <div class="flex flex-col gap-1.5">
                                    <label
                                        class="font-pretendard text-zinc-500 text-[0.75rem]"
                                        for="d-parallel-{sport.id}"
                                        >동시 경기 가능 수</label
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
                                        class="font-pretendard text-[0.875rem] border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 focus:outline-none focus:border-zinc-400"
                                    />
                                </div>
                            </div>

                            <!-- Daily timing config -->
                            <div class="flex flex-col gap-2">
                                <p
                                    class="font-pretendard font-medium text-zinc-600 text-[0.875rem] m-0"
                                >
                                    시간 설정
                                </p>
                                <div class="grid grid-cols-3 gap-3">
                                    <div class="flex flex-col gap-1.5">
                                        <label
                                            class="font-pretendard text-zinc-500 text-[0.75rem]"
                                            for="d-start-{sport.id}"
                                            >매일 시작 시간</label
                                        >
                                        <input
                                            id="d-start-{sport.id}"
                                            type="time"
                                            name="dailyStartTime"
                                            bind:value={
                                                sportForms[sport.id]
                                                    .dailyStartTime
                                            }
                                            class="font-pretendard text-[0.875rem] border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 focus:outline-none focus:border-zinc-400"
                                        />
                                    </div>
                                    <div class="flex flex-col gap-1.5">
                                        <label
                                            class="font-pretendard text-zinc-500 text-[0.75rem]"
                                            for="d-end-{sport.id}"
                                            >매일 종료 시간</label
                                        >
                                        <input
                                            id="d-end-{sport.id}"
                                            type="time"
                                            name="dailyEndTime"
                                            bind:value={
                                                sportForms[sport.id]
                                                    .dailyEndTime
                                            }
                                            class="font-pretendard text-[0.875rem] border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 focus:outline-none focus:border-zinc-400"
                                        />
                                    </div>
                                    <div class="flex flex-col gap-1.5">
                                        <label
                                            class="font-pretendard text-zinc-500 text-[0.75rem]"
                                            for="d-interval-{sport.id}"
                                            >간격 (분단위)</label
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
                                            class="font-pretendard text-[0.875rem] border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 focus:outline-none focus:border-zinc-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <!-- Full game period -->
                            <div class="flex flex-col gap-2">
                                <p
                                    class="font-pretendard font-medium text-zinc-600 text-[0.875rem] m-0"
                                >
                                    전체 게임 기간
                                </p>
                                <div class="grid grid-cols-3 gap-3">
                                    <div class="flex flex-col gap-1.5">
                                        <label
                                            class="font-pretendard text-zinc-500 text-[0.75rem]"
                                            for="p-start-{sport.id}">시작</label
                                        >
                                        <input
                                            id="p-start-{sport.id}"
                                            type="datetime-local"
                                            name="periodStart"
                                            bind:value={
                                                sportForms[sport.id].periodStart
                                            }
                                            class="font-pretendard text-[0.875rem] border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 focus:outline-none focus:border-zinc-400 transition-colors"
                                        />
                                    </div>
                                    <div class="flex flex-col gap-1.5">
                                        <label
                                            class="font-pretendard text-zinc-500 text-[0.75rem]"
                                            for="p-end-{sport.id}">종료</label
                                        >
                                        <input
                                            id="p-end-{sport.id}"
                                            type="datetime-local"
                                            name="periodEnd"
                                            bind:value={
                                                sportForms[sport.id].periodEnd
                                            }
                                            class="font-pretendard text-[0.875rem] border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 focus:outline-none focus:border-zinc-400 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <!-- Round-1 window -->
                            <div class="flex flex-col gap-2">
                                <p
                                    class="font-pretendard font-medium text-zinc-600 text-[0.875rem] m-0"
                                >
                                    첫 라운드 일정 선택 기간
                                </p>
                                <div
                                    class="grid grid-cols-1 gap-3 sm:grid-cols-3"
                                >
                                    <div class="flex flex-col gap-1.5">
                                        <label
                                            class="font-pretendard text-zinc-500 text-[0.75rem]"
                                            for="s-start-{sport.id}"
                                            >첫 라운드 기간 시작일</label
                                        >
                                        <input
                                            id="s-start-{sport.id}"
                                            type="datetime-local"
                                            name="selectionStart"
                                            bind:value={
                                                sportForms[sport.id].selStart
                                            }
                                            class="font-pretendard text-[0.875rem] border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 focus:outline-none focus:border-zinc-400 transition-colors"
                                        />
                                    </div>
                                    <div class="flex flex-col gap-1.5">
                                        <label
                                            class="font-pretendard text-zinc-500 text-[0.75rem]"
                                            for="s-end-{sport.id}"
                                            >첫 라운드 기간 종료일</label
                                        >
                                        <input
                                            id="s-end-{sport.id}"
                                            type="datetime-local"
                                            name="selectionEnd"
                                            bind:value={
                                                sportForms[sport.id].selEnd
                                            }
                                            class="font-pretendard text-[0.875rem] border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 focus:outline-none focus:border-zinc-400 transition-colors"
                                        />
                                    </div>
                                    <div class="flex flex-col gap-1.5">
                                        <label
                                            class="font-pretendard text-zinc-500 text-[0.75rem]"
                                            for="s-dl-{sport.id}"
                                            >선택 마감일</label
                                        >
                                        <input
                                            id="s-dl-{sport.id}"
                                            type="datetime-local"
                                            name="deadline"
                                            bind:value={
                                                sportForms[sport.id].deadline
                                            }
                                            class="font-pretendard text-[0.875rem] border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 focus:outline-none focus:border-zinc-400 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div class="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isScheduleUpdating[sport.id]}
                                    class="font-pretendard font-medium text-[0.875rem] bg-zinc-800 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 active:bg-zinc-800 transition-colors disabled:opacity-50"
                                >
                                    {isScheduleUpdating[sport.id]
                                        ? "저장 중..."
                                        : "저장하기"}
                                </button>
                            </div>
                        </form>
                    {/if}
                {/each}
            {/if}
        </div>
    </div>
</div>
