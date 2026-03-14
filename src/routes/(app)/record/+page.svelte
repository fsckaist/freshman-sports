<script lang="ts">
    import { page } from "$app/state";
    import MatchSidebar from "$lib/components/record/MatchSidebar.svelte";
    import AttendanceTracker from "$lib/components/record/AttendanceTracker.svelte";
    import MatchLogPanel from "$lib/components/record/MatchLogPanel.svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    // Derived activeMatchId from URL search params using Svelte 5's $page.url
    let activeMatchId = $derived(page.url.searchParams.get("matchId"));

    // Sport sidebar tab management
    let activeSportId = $state(data.allSports?.[0]?.id || null);
    let filteredMatches = $derived(
        activeSportId
            ? data.allMatches.filter((m) => m.sportId === activeSportId)
            : data.allMatches,
    );
</script>

<div
    class="flex flex-row gap-[1.875rem] w-full h-full relative overflow-hidden"
>
    <!-- Left Column: Match Sidebar Area -->
    <div class="flex-1 w-[25rem] flex flex-col h-full overflow-hidden">
        <!-- Sidebar Title -->
        <div class="flex items-center gap-[0.625rem] mb-[1.25rem] shrink-0">
            <h1
                class="font-pretendard font-bold text-zinc-600 text-[1.5rem] m-0 whitespace-nowrap"
            >
                경기 일정
            </h1>
            <div class="flex-1 bg-zinc-300 h-px rounded-full"></div>
        </div>

        <!-- Sport Tabs -->
        <div
            class="flex items-center gap-2 mb-4 overflow-x-auto hide-scrollbar shrink-0"
        >
            {#each data.allSports as sport}
                <button
                    onclick={() => (activeSportId = sport.id)}
                    class="px-4 py-2 rounded-full whitespace-nowrap font-pretendard font-semibold text-sm transition-all border
                    {activeSportId === sport.id
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'}"
                >
                    {sport.name}
                </button>
            {/each}
        </div>

        <!-- Scrollable Sidebar Container -->
        <div
            class="flex-1 min-h-0 bg-zinc-50 rounded-[1.25rem] shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] border border-transparent p-[0.625rem] overflow-hidden flex flex-col"
        >
            <div class="flex-1 overflow-y-auto hide-scrollbar p-[0.625rem]">
                <MatchSidebar matches={filteredMatches} {activeMatchId} />
            </div>
        </div>
    </div>

    <!-- Right Column: Active Match Details Area -->
    <div class="flex-1 flex flex-col h-full min-h-0 relative overflow-hidden">
        {#if data.activeMatchDetails}
            <!-- Attendance Management Section -->
            <div class="flex flex-col shrink-0">
                <div class="flex items-center gap-[0.625rem] mb-[1.25rem]">
                    <h2
                        class="font-pretendard font-bold text-zinc-600 text-[1.5rem] m-0 whitespace-nowrap"
                    >
                        인원 관리
                    </h2>
                    <div class="flex-1 bg-zinc-300 h-px rounded-full"></div>
                </div>
                <div
                    class="bg-zinc-50 rounded-[1.25rem] p-[1rem] shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] mb-[1.875rem]"
                >
                    <AttendanceTracker activeMatch={data.activeMatchDetails} />
                </div>
            </div>

            <!-- Match Log/Record Section -->
            <div class="flex-1 flex flex-col min-h-0">
                <div
                    class="flex items-center gap-[0.625rem] mb-[1.25rem] shrink-0"
                >
                    <h2
                        class="font-pretendard font-bold text-zinc-600 text-[1.5rem] m-0 whitespace-nowrap"
                    >
                        경기 기록지
                    </h2>
                    <div class="flex-1 bg-zinc-300 h-px rounded-full"></div>
                </div>
                <div
                    class="flex-1 min-h-0 bg-zinc-50 rounded-[1.25rem] shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] overflow-hidden"
                >
                    <div class="h-full overflow-y-auto hide-scrollbar">
                        <MatchLogPanel activeMatch={data.activeMatchDetails} />
                    </div>
                </div>
            </div>
        {:else}
            <!-- Empty State Case: No Match Selected -->
            <div
                class="flex-1 flex flex-col items-center justify-center p-[3.125rem] text-center"
            >
                <div class="w-[5rem] h-[5rem] text-zinc-200 mb-[1.25rem]">
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
                    class="font-pretendard font-bold text-zinc-800 text-[1.5rem] mb-[0.625rem]"
                >
                    경기를 선택해주세요
                </h3>
                <p
                    class="font-pretendard font-medium text-zinc-400 text-[1.125rem] max-w-[20rem]"
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
