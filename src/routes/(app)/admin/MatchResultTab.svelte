<script lang="ts">
    import MatchLogPanel from "$lib/components/record/MatchLogPanel.svelte";
    import { enhance } from "$app/forms";
    import { i18n } from "$lib/i18n.svelte";

    let {
        sports = [],
        activeSportId = null,
        finishedMatches = [],
        activeResultMatch = null,
    }: {
        sports: any[];
        activeSportId: string | null;
        finishedMatches: any[];
        activeResultMatch: any;
    } = $props();

    let isSubmitting = $state(false);
    let isByeProcessing = $state(false);
    let byeProcessed: number | null = $state(null);
</script>

<div
    class="flex flex-col bg-white dark:bg-zinc-900 rounded-[1.25rem] w-full flex-[1_0_0] relative overflow-hidden shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] dark:shadow-none h-full"
>
    <!-- Sport Selection Tabs (Secondary) -->
    <div
        class="flex items-center shrink-0 w-full border-b border-zinc-200 dark:border-zinc-800"
    >
        {#each sports as sport, i}
            <a
                href="?tab=result&sportId={sport.id}"
                class="flex flex-[1_0_0] items-center justify-center h-[3.125rem] cursor-pointer outline-none transition-colors duration-200 no-underline
                {activeSportId === sport.id
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-500'
                    : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-transparent'}
                {i !== sports.length - 1
                    ? 'border-r border-zinc-200 dark:border-zinc-800'
                    : ''}"
            >
                <p
                    class="font-pretendard font-semibold text-[1rem] m-0 transition-colors duration-200"
                >
                    {i18n.decode(sport.name)}
                </p>
            </a>
        {/each}
    </div>

    <!-- Header -->
    <div
        class="flex items-center justify-between px-[1.875rem] py-4 shrink-0 border-b border-zinc-100 dark:border-zinc-800"
    >
        <div>
            <h2
                class="font-pretendard font-bold text-zinc-800 dark:text-zinc-100 text-[1.25rem] m-0"
            >
                {i18n.t({ ko: '경기 결과 확정', en: 'Confirm Match Result' })}
            </h2>
            <p
                class="font-pretendard font-normal text-zinc-500 text-[0.875rem] m-0 mt-1"
            >
                {i18n.t({ ko: '종료된 경기들의 승패를 관리자가 최종적으로 확정합니다.', en: 'Administrator finally confirms the win/loss of finished matches.' })}
            </p>
        </div>

        <!-- Bye Match Auto-process -->
        <form
            method="POST"
            action="?/processByeMatches"
            use:enhance={() => {
                isByeProcessing = true;
                return async ({ result, update }) => {
                    isByeProcessing = false;
                    if (result.type === "success") {
                        byeProcessed =
                            (result.data as any)?.processedCount ?? 0;
                    }
                    update();
                };
            }}
        >
            <input type="hidden" name="sportId" value={activeSportId} />
            <div class="flex flex-col items-end gap-1">
                <button
                    type="submit"
                    disabled={isByeProcessing}
                    class="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                    {isByeProcessing ? i18n.t({ ko: "처리 중...", en: "Processing..." }) : i18n.t({ ko: "부전승 자동 처리", en: "Auto-process Bye Matches" })}
                </button>
                {#if byeProcessed !== null}
                    <span class="text-xs text-zinc-400 dark:text-zinc-500"
                        >{byeProcessed}{i18n.t({ ko: "건 처리됨", en: " cases processed" })}</span
                    >
                {/if}
            </div>
        </form>
    </div>

    <!-- Main Content Area: Left Sidebar (Matches) & Right Content (Match Panel) -->
    <div class="flex flex-row flex-[1_0_0] w-full min-h-0 overflow-hidden">
        <!-- Match Navigation Sidebar -->
        <div
            class="flex flex-col gap-3 overflow-y-auto w-[18rem] shrink-0 p-[1.875rem] py-6 border-r border-zinc-100 dark:border-zinc-800 hide-scrollbar scroll-smooth bg-zinc-50/50 dark:bg-zinc-900/50"
        >
            {#each finishedMatches as matchPair}
                <a
                    href="?tab=result&sportId={activeSportId}&resultMatchId={matchPair.id}"
                    class="flex flex-[0_0_auto] flex-col gap-1 items-center justify-center py-4 px-4 rounded-xl border transition-all cursor-pointer no-underline
                    {activeResultMatch?.id === matchPair.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-[0_0_0.625rem_rgba(245,158,11,0.1)]'
                        : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:shadow-sm'}"
                >
                    <div
                        class="flex gap-1 items-center font-bold tracking-wide px-2 py-0.5 rounded text-[0.7rem]
                        {activeResultMatch?.id === matchPair.id
                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100'
                            : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'}"
                    >
                        <span>{i18n.decode(matchPair.sportName)}</span>
                        {#if matchPair.matchName}
                            <span class="opacity-50">•</span>
                            <span>{i18n.decode(matchPair.matchName)}</span>
                        {/if}
                    </div>
                    <div
                        class="flex gap-2 items-center font-bold text-lg text-zinc-800 dark:text-zinc-100"
                    >
                        <span
                            >{matchPair.classA
                                ? `${i18n.t({ ko: "", en: "Class " })}${matchPair.classA}${i18n.t({ ko: "반", en: "" })}`
                                : i18n.t({ ko: "미정", en: "TBD" })}</span
                        >
                        <span class="text-[0.6rem] text-zinc-400">VS</span>
                        <span
                            >{matchPair.classB
                                ? `${i18n.t({ ko: "", en: "Class " })}${matchPair.classB}${i18n.t({ ko: "반", en: "" })}`
                                : i18n.t({ ko: "미정", en: "TBD" })}</span
                        >
                    </div>
                </a>
            {/each}
            {#if finishedMatches.length === 0}
                <div
                    class="text-zinc-400 dark:text-zinc-500 text-sm py-4 text-center"
                >
                    {i18n.t({ ko: '결과 확정이 필요한 경기가 없습니다.', en: 'No matches requiring result confirmation.' })}
                </div>
            {/if}
        </div>

        <!-- Right Container -->
        <div
            class="flex-1 flex flex-col overflow-auto min-h-0 min-w-0 relative p-[1.875rem] py-6 bg-white dark:bg-zinc-950 gap-6"
        >
            {#if activeResultMatch}
                <!-- Reusing MatchLogPanel from Record Page for simple view -->
                <div class="w-full flex justify-center">
                    <MatchLogPanel activeMatch={activeResultMatch} />
                </div>

                <!-- Winner Selection Form -->
                <div
                    class="w-full flex flex-col gap-4 max-w-2xl mx-auto border-t border-zinc-100 dark:border-zinc-800 pt-6"
                >
                    <h3
                        class="font-pretendard font-bold text-lg text-center text-zinc-800 dark:text-zinc-100 m-0"
                    >
                        {i18n.t({ ko: '승리 팀 확정하기', en: 'Confirm Winner' })}
                    </h3>
                    <p
                        class="text-sm text-zinc-500 dark:text-zinc-400 text-center m-0"
                    >
                        {i18n.t({ ko: '위 기록을 바탕으로 어느 팀을 승리 팀으로 기록하시겠습니까? (이 결정은 되돌릴 수 없습니다)', en: 'Based on the above records, which team would you like to record as the winner? (This decision cannot be undone)' })}
                    </p>
                    <div
                        class="flex gap-4 items-center justify-center w-full mt-2"
                    >
                        <!-- Class A Winner Button -->
                        <form
                            method="POST"
                            action="?/finalizeMatchResult"
                            use:enhance={() => {
                                isSubmitting = true;
                                return async ({ update }) => {
                                    isSubmitting = false;
                                    update();
                                };
                            }}
                            class="flex-1"
                        >
                            <input
                                type="hidden"
                                name="matchId"
                                value={activeResultMatch.id}
                            />
                            <input
                                type="hidden"
                                name="winnerClassId"
                                value={activeResultMatch.classAId}
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                class="w-full py-4 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl font-bold text-lg text-zinc-800 dark:text-zinc-100 transition-all"
                            >
                                {i18n.t({ ko: "", en: "Class " })}{activeResultMatch.classA}{i18n.t({ ko: "반 승리", en: " Win" })}
                            </button>
                        </form>

                        <!-- Class B Winner Button -->
                        <form
                            method="POST"
                            action="?/finalizeMatchResult"
                            use:enhance={() => {
                                isSubmitting = true;
                                return async ({ update }) => {
                                    isSubmitting = false;
                                    update();
                                };
                            }}
                            class="flex-1"
                        >
                            <input
                                type="hidden"
                                name="matchId"
                                value={activeResultMatch.id}
                            />
                            <input
                                type="hidden"
                                name="winnerClassId"
                                value={activeResultMatch.classBId}
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                class="w-full py-4 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl font-bold text-lg text-zinc-800 dark:text-zinc-100 transition-all"
                            >
                                {i18n.t({ ko: "", en: "Class " })}{activeResultMatch.classB}{i18n.t({ ko: "반 승리", en: " Win" })}
                            </button>
                        </form>
                    </div>

                    <!-- Both Lose Button -->
                    <form
                        method="POST"
                        action="?/finalizeMatchResult"
                        use:enhance={() => {
                            isSubmitting = true;
                            return async ({ update }) => {
                                isSubmitting = false;
                                update();
                            };
                        }}
                        class="w-full"
                    >
                        <input
                            type="hidden"
                            name="matchId"
                            value={activeResultMatch.id}
                        />
                        <input
                            type="hidden"
                            name="winnerClassId"
                            value="none"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            class="w-full py-[0.875rem] border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl font-bold text-lg text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all disabled:opacity-50"
                        >
                            {i18n.t({ ko: '결과 없음 (양 팀 탈락)', en: 'No Result (Both Eliminated)' })}
                        </button>
                    </form>
                </div>
            {:else}
                <div
                    class="flex items-center justify-center w-full h-full py-12"
                >
                    <p
                        class="font-pretendard font-normal text-zinc-400 dark:text-zinc-500 text-[0.875rem] m-0 text-center"
                    >
                        {i18n.t({ ko: '좌측 메뉴에서 매치를 선택하세요.', en: 'Select a match from the left menu.' })}
                    </p>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
