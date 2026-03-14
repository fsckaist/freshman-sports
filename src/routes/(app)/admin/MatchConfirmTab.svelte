<script lang="ts">
    import ScheduleSelectionGrid from "$lib/components/schedule/ScheduleSelectionGrid.svelte";
    import { enhance } from "$app/forms";

    let {
        sports = [],
        activeSportId = null,
        completedClasses = [],
        activeMatch = null,
        confirmGridData = {},
        allUsers = [],
    }: {
        sports: any[];
        activeSportId: string | null;
        completedClasses: any[];
        activeMatch: any;
        confirmGridData: Record<string, any[]>;
        allUsers: any[];
    } = $props();

    let isModalOpen = $state(false);
    let selectedSlotId: string | null = $state(null);
    let selectedRefereeId = $state("");
    let selectedManagerId = $state("");

    function openFinalizeModal(slotId: string) {
        selectedSlotId = slotId;
        isModalOpen = true;
    }

    function closeModal() {
        isModalOpen = false;
        selectedSlotId = null;
    }
</script>

<div
    class="flex flex-col bg-white dark:bg-zinc-900 rounded-[1.25rem] w-full flex-[1_0_0] relative overflow-hidden shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] dark:shadow-none h-full"
>
    <!-- Sport Selection Tabs (Secondary) -->
    <div class="flex items-center shrink-0 w-full border-b border-zinc-200">
        {#each sports as sport, i}
            <a
                href="?tab=confirm&sportId={sport.id}"
                class="flex flex-[1_0_0] items-center justify-center h-[3.125rem] cursor-pointer outline-none transition-colors duration-200 no-underline
                {activeSportId === sport.id
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-500'
                    : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-transparent'}
                {i !== sports.length - 1 ? 'border-r border-zinc-200 dark:border-zinc-800' : ''}"
            >
                <p
                    class="font-pretendard font-semibold text-[1rem] m-0 transition-colors duration-200"
                >
                    {sport.name}
                </p>
            </a>
        {/each}
    </div>
    <!-- Header -->
    <div
        class="flex items-center justify-between px-[1.875rem] py-4 shrink-0 border-b border-zinc-100 dark:border-zinc-800"
    >
        <div class="flex flex-col">
            <h2
                class="font-pretendard font-bold text-zinc-800 dark:text-zinc-100 text-[1.25rem] m-0"
            >
                경기 확정 대기 목록
            </h2>
            <p
                class="font-pretendard font-normal text-zinc-500 text-[0.875rem] m-0 mt-1"
            >
                서로 투표를 진행 중인 반들의 목록입니다. 가장 인원이 많이 겹치는
                시간대를 골라 경기를 확정해 주세요.
            </p>
        </div>
    </div>

    <!-- Main Content Area: Left Sidebar (Matches) & Right Content (Grid) -->
    <div class="flex flex-row flex-[1_0_0] w-full min-h-0 overflow-hidden">
        <!-- Match Navigation Sidebar -->
        <div
            class="flex flex-col gap-3 overflow-y-auto w-[18rem] shrink-0 p-[1.875rem] py-6 border-r border-zinc-100 dark:border-zinc-800 hide-scrollbar scroll-smooth bg-zinc-50/50 dark:bg-zinc-900/50"
        >
            {#each completedClasses.filter((m) => m.classA && m.classB) as matchPair}
                <a
                    href="?tab=confirm&sportId={activeSportId}&matchId={matchPair.id}"
                    class="flex flex-[0_0_auto] flex-col gap-1 items-center justify-center py-4 px-4 rounded-xl border transition-all cursor-pointer no-underline
                    {activeMatch?.id === matchPair.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-[0_0_0.625rem_rgba(245,158,11,0.1)]'
                        : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:shadow-sm'}"
                >
                    <div
                        class="flex gap-1 items-center font-bold tracking-wide px-2 py-0.5 rounded text-[0.7rem]
                        {activeMatch?.id === matchPair.id
                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100'
                            : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'}"
                    >
                        {#if matchPair.matchName}
                            <span>{matchPair.matchName}</span>
                        {/if}
                    </div>
                    <div
                        class="flex gap-2 items-center font-bold text-lg text-zinc-800 dark:text-zinc-100"
                    >
                        <span>{matchPair.classA}반</span>
                        <span class="text-[0.6rem] text-zinc-400 dark:text-zinc-500">VS</span>
                        <span>{matchPair.classB}반</span>
                    </div>
                </a>
            {/each}
            {#if completedClasses.length === 0}
                <div class="text-zinc-400 dark:text-zinc-500 text-sm py-4 text-center">
                    경기 확정 대기 중인 매치가 없습니다.
                </div>
            {/if}
        </div>

        <!-- Grid Container -->
        <div
            class="flex-1 flex flex-col overflow-auto w-0 min-w-0 min-h-0 relative py-6 bg-white dark:bg-zinc-900"
        >
            {#if Object.keys(confirmGridData).length === 0}
                <div
                    class="flex items-center justify-center w-full h-full py-12"
                >
                    <p
                        class="font-pretendard font-normal text-zinc-400 dark:text-zinc-500 text-[0.875rem] m-0 text-center"
                    >
                        선택된 매치의 일정이 없습니다.
                    </p>
                </div>
            {:else}
                <div class="w-full h-fit p-[1.875rem]">
                    <div class="w-fit mx-auto">
                        <ScheduleSelectionGrid
                            gridData={confirmGridData}
                            currentUserClassId={activeMatch?.classAId}
                            opponentClassId={activeMatch?.classBId}
                            minPlayers={sports.find(
                                (s) => s.id === activeSportId,
                            )?.minPlayers ?? 5}
                            isDisabled={false}
                            isAdmin={false}
                            isConfirmMode={true}
                            onSlotClick={openFinalizeModal}
                        />
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>

<!-- Modal -->
{#if isModalOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 cursor-pointer"
        onclick={closeModal}
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="bg-white dark:bg-zinc-900 rounded-[1.5rem] w-full max-w-[28rem] flex flex-col items-center justify-center p-[2rem] gap-[1.5rem] shadow-2xl cursor-default border dark:border-zinc-800"
            onclick={(e) => e.stopPropagation()}
        >
            <h3
                class="font-pretendard font-bold text-[1.5rem] text-zinc-800 dark:text-zinc-100 m-0"
            >
                경기 시간 확정
            </h3>
            <p
                class="text-center text-zinc-500 dark:text-zinc-400 font-pretendard text-[0.9rem] m-0 leading-relaxed"
            >
                해당 시간대로 {activeMatch?.classA
                    ? `${activeMatch.classA}반`
                    : "미정"}과 {activeMatch?.classB
                    ? `${activeMatch.classB}반`
                    : "미정"}의<br />
                <b>{activeMatch?.sportName}</b> 경기를 확정하시겠습니까?
            </p>

            <form
                method="POST"
                action="?/finalizeMatch"
                use:enhance={() => {
                    closeModal();
                    return async ({ update }) => {
                        update();
                    };
                }}
                class="w-full flex flex-col gap-4"
            >
                <input type="hidden" name="matchId" value={activeMatch?.id} />
                <input type="hidden" name="scheduleId" value={selectedSlotId} />

                <div class="flex flex-col gap-2 w-full">
                    <label
                        for="refereeId"
                        class="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                        >심판 배정</label
                    >
                    <select
                        id="refereeId"
                        name="refereeId"
                        bind:value={selectedRefereeId}
                        class="w-full text-base p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:border-amber-500 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 transition-colors"
                    >
                        <option value="">심판 선택 안 함</option>
                        {#each allUsers.filter((u) => u.isReferee) as user}
                            <option value={user.id}
                                >{user.name} ({user.studentNumber})</option
                            >
                        {/each}
                    </select>
                </div>

                <div class="flex flex-col gap-2 w-full">
                    <label
                        for="managerId"
                        class="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                        >담당 매니저 배정</label
                    >
                    <select
                        id="managerId"
                        name="managerId"
                        bind:value={selectedManagerId}
                        class="w-full text-base p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:border-amber-500 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 transition-colors"
                    >
                        <option value="">매니저 선택 안 함</option>
                        {#each allUsers.filter((u) => u.isManager) as user}
                            <option value={user.id}
                                >{user.name} ({user.studentNumber})</option
                            >
                        {/each}
                    </select>
                </div>

                <div class="flex gap-3 w-full mt-4">
                    <button
                        type="button"
                        class="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl transition-colors"
                        onclick={closeModal}
                    >
                        취소하기
                    </button>
                    <button
                        type="submit"
                        class="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors"
                    >
                        경기 확정
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
