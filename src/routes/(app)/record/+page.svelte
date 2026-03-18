<script lang="ts">
    import { page } from "$app/state";
    import MatchSidebar from "$lib/components/record/MatchSidebar.svelte";
    import AttendanceTracker from "$lib/components/record/AttendanceTracker.svelte";
    import MatchLogPanel from "$lib/components/record/MatchLogPanel.svelte";
    import type { PageData } from "./$types";
    import { slide } from "svelte/transition";
    import chevronDownIcon from "@gravity-ui/icons/svgs/chevron-down.svg?raw";

    let { data }: { data: PageData } = $props();

    // Derived activeMatchId from URL search params using Svelte 5's $page.url
    let activeMatchId = $derived(page.url.searchParams.get("matchId"));

    // Sport sidebar tab management
    let activeSportId = $state<string | null>(null);

    // Section collapse states
    let isScheduleCollapsed = $state(false);
    let isAttendanceCollapsed = $state(false);
    let isLogCollapsed = $state(false);

    $effect(() => {
        if (activeSportId === null && data.allSports?.length > 0) {
            activeSportId = data.allSports[0].id;
        }
    });
    let filteredMatches = $derived(
        activeSportId
            ? data.allMatches.filter((m) => m.sportId === activeSportId)
            : data.allMatches,
    );
</script>

<div
    class="flex flex-col lg:flex-row gap-6 lg:gap-[1.875rem] w-full lg:h-full relative lg:overflow-hidden"
>
    <!-- Left Column: Match Sidebar Area -->
    <div
        class="flex flex-col {isScheduleCollapsed
            ? 'flex-none'
            : 'flex-1'} lg:flex-1 lg:w-[25rem] lg:h-full lg:overflow-hidden min-w-0"
    >
        <!-- Sidebar Title (Toggleable) -->
        <button
            class="group flex items-center gap-[0.625rem] mb-[1.25rem] shrink-0 w-full border-none bg-transparent p-0 cursor-pointer text-left"
            onclick={() => (isScheduleCollapsed = !isScheduleCollapsed)}
        >
            <h1
                class="font-pretendard font-bold text-zinc-600 dark:text-zinc-400 text-[1.5rem] m-0 whitespace-nowrap"
            >
                경기 일정
            </h1>
            <div
                class="flex items-center justify-center size-8 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-all {isScheduleCollapsed
                    ? ''
                    : 'rotate-180'}"
            >
                {@html chevronDownIcon}
            </div>
            <div
                class="flex-1 bg-zinc-300 dark:bg-zinc-700 h-px rounded-full"
            ></div>
        </button>

        {#if !isScheduleCollapsed}
            <div
                transition:slide
                class="flex flex-col lg:h-full lg:overflow-hidden min-h-0"
            >
                <!-- Sport Tabs -->
                <div
                    class="flex items-center gap-2 mb-4 overflow-x-auto hide-scrollbar shrink-0"
                >
                    {#each data.allSports as sport}
                        <button
                            onclick={() => (activeSportId = sport.id)}
                            class="px-4 py-2 rounded-full whitespace-nowrap font-pretendard font-semibold text-sm transition-all border
                            {activeSportId === sport.id
                                ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                                : 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'}"
                        >
                            {sport.name}
                        </button>
                    {/each}
                </div>

                <!-- Scrollable Sidebar Container -->
                <div
                    class="flex-1 min-h-0 bg-white dark:bg-zinc-900 rounded-[1.25rem] shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] dark:shadow-none border border-zinc-200 dark:border-zinc-800 p-[0.625rem] overflow-hidden flex flex-col"
                >
                    <div
                        class="flex-1 overflow-y-auto hide-scrollbar p-[0.625rem]"
                    >
                        <MatchSidebar
                            matches={filteredMatches}
                            {activeMatchId}
                        />
                    </div>
                </div>
            </div>
        {/if}
    </div>

    <!-- Right Column: Active Match Details Area -->
    <div
        class="flex-none lg:flex-1 flex flex-col lg:h-full min-h-0 relative lg:overflow-hidden gap-6"
    >
        {#if data.activeMatchDetails}
            <!-- Attendance Management Section -->
            <div class="flex flex-col shrink-0 min-w-0">
                <button
                    class="group flex items-center gap-[0.625rem] mb-[1.25rem] w-full border-none bg-transparent p-0 cursor-pointer text-left"
                    onclick={() =>
                        (isAttendanceCollapsed = !isAttendanceCollapsed)}
                >
                    <h2
                        class="font-pretendard font-bold text-zinc-600 dark:text-zinc-400 text-[1.5rem] m-0 whitespace-nowrap"
                    >
                        인원 관리
                    </h2>
                    <div
                        class="flex items-center justify-center size-8 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-all {isAttendanceCollapsed
                            ? ''
                            : 'rotate-180'}"
                    >
                        {@html chevronDownIcon}
                    </div>
                    <div
                        class="flex-1 bg-zinc-300 dark:bg-zinc-700 h-px rounded-full"
                    ></div>
                </button>
                {#if !isAttendanceCollapsed}
                    <div
                        transition:slide
                        class="bg-white dark:bg-zinc-900 rounded-[1.25rem] p-[1rem] shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] dark:shadow-none border border-zinc-200 dark:border-zinc-800"
                    >
                        <AttendanceTracker
                            activeMatch={data.activeMatchDetails}
                        />
                    </div>
                {/if}
            </div>

            <!-- Match Log/Record Section -->
            <div
                class="{isLogCollapsed
                    ? 'flex-none'
                    : 'flex-none lg:flex-1'} flex flex-col lg:h-full lg:overflow-hidden min-h-0 min-w-0"
            >
                <button
                    class="group flex items-center gap-[0.625rem] mb-[1.25rem] shrink-0 w-full border-none bg-transparent p-0 cursor-pointer text-left"
                    onclick={() => (isLogCollapsed = !isLogCollapsed)}
                >
                    <h2
                        class="font-pretendard font-bold text-zinc-600 dark:text-zinc-400 text-[1.5rem] m-0 whitespace-nowrap"
                    >
                        경기 기록지
                    </h2>
                    <div
                        class="flex items-center justify-center size-8 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-all {isLogCollapsed
                            ? ''
                            : 'rotate-180'}"
                    >
                        {@html chevronDownIcon}
                    </div>
                    <div
                        class="flex-1 bg-zinc-300 dark:bg-zinc-700 h-px rounded-full"
                    ></div>
                </button>
                {#if !isLogCollapsed}
                    <div
                        transition:slide
                        class="flex-none lg:flex-1 flex flex-col lg:h-full lg:overflow-hidden min-h-0"
                    >
                        <div class="flex-none lg:flex-1 lg:overflow-y-auto hide-scrollbar">
                            <MatchLogPanel
                                activeMatch={data.activeMatchDetails}
                            />
                        </div>
                    </div>
                {/if}
            </div>
        {:else}
            <!-- Empty State Case: No Match Selected -->
            <div
                class="flex-1 flex flex-col items-center justify-center p-[3.125rem] text-center"
            >
                <div
                    class="w-[5rem] h-[5rem] text-zinc-600 dark:text-zinc-500 mb-[1.25rem]"
                >
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
                <h3
                    class="font-pretendard font-bold text-zinc-600 dark:text-zinc-400 text-[1.5rem] mb-[0.625rem]"
                >
                    경기를 선택해주세요
                </h3>
                <p
                    class="font-pretendard font-medium text-zinc-400 dark:text-zinc-500 text-[1.125rem] max-w-[20rem]"
                >
                    좌측 리스트에서 경기 기록 혹은 관리가 필요한 매치를
                    선택해주세요.
                </p>
            </div>
        {/if}
    </div>
</div>

<style>
    /* Custom vertical scrollbar hiding while maintaining functionality */
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
