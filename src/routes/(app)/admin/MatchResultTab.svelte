<script lang="ts">
    import MatchLogPanel from "$lib/components/record/MatchLogPanel.svelte";
    import { enhance } from "$app/forms";

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
    class="flex flex-col bg-white rounded-[1.25rem] w-full flex-[1_0_0] relative overflow-hidden shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] h-full"
>
    <!-- Sport Selection Tabs (Secondary) -->
    <div class="flex items-center shrink-0 w-full border-b border-zinc-200">
        {#each sports as sport, i}
            <a
                href="?tab=result&sportId={sport.id}"
                class="flex flex-[1_0_0] items-center justify-center h-[3.125rem] cursor-pointer outline-none transition-colors duration-200 no-underline
                {activeSportId === sport.id
                    ? 'bg-amber-50 text-amber-600  border-amber-500'
                    : 'bg-white hover:bg-zinc-50 text-zinc-600  border-transparent'}
                {i !== sports.length - 1 ? 'border-r border-zinc-200' : ''}"
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
        class="flex items-center justify-between px-[1.875rem] py-4 shrink-0 border-b border-zinc-100"
    >
        <div>
            <h2
                class="font-pretendard font-bold text-zinc-800 text-[1.25rem] m-0"
            >
                경기 결과 확정
            </h2>
            <p
                class="font-pretendard font-normal text-zinc-500 text-[0.875rem] m-0 mt-1"
            >
                종료된 경기들의 승패를 관리자가 최종적으로 확정합니다.
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
                    class="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                    {isByeProcessing ? "처리 중..." : "부전승 자동 처리"}
                </button>
                {#if byeProcessed !== null}
                    <span class="text-xs text-zinc-400"
                        >{byeProcessed}건 처리됨</span
                    >
                {/if}
            </div>
        </form>
    </div>

    <!-- Main Content Area: Left Sidebar (Matches) & Right Content (Match Panel) -->
    <div class="flex flex-row flex-[1_0_0] w-full min-h-0 overflow-hidden">
        <!-- Match Navigation Sidebar -->
        <div
            class="flex flex-col gap-3 overflow-y-auto w-[18rem] shrink-0 p-[1.875rem] py-6 border-r border-zinc-100 hide-scrollbar scroll-smooth bg-zinc-50/50"
        >
            {#each finishedMatches as matchPair}
                <a
                    href="?tab=result&sportId={activeSportId}&resultMatchId={matchPair.id}"
                    class="flex flex-[0_0_auto] flex-col gap-1 items-center justify-center py-4 px-4 rounded-xl border transition-all cursor-pointer no-underline
                    {activeResultMatch?.id === matchPair.id
                        ? 'border-amber-500 bg-amber-50 shadow-[0_0_0.625rem_rgba(245,158,11,0.1)]'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50 hover:shadow-sm'}"
                >
                    <div
                        class="flex gap-1 items-center font-bold tracking-wide px-2 py-0.5 rounded text-[0.7rem]
                        {activeResultMatch?.id === matchPair.id
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-zinc-100 text-zinc-800'}"
                    >
                        <span>{matchPair.sportName}</span>
                        {#if matchPair.matchName}
                            <span class="opacity-50">•</span>
                            <span>{matchPair.matchName}</span>
                        {/if}
                    </div>
                    <div
                        class="flex gap-2 items-center font-bold text-lg text-zinc-800"
                    >
                        <span
                            >{matchPair.classA
                                ? `${matchPair.classA}반`
                                : "미정"}</span
                        >
                        <span class="text-[0.6rem] text-zinc-400">VS</span>
                        <span
                            >{matchPair.classB
                                ? `${matchPair.classB}반`
                                : "미정"}</span
                        >
                    </div>
                </a>
            {/each}
            {#if finishedMatches.length === 0}
                <div class="text-zinc-400 text-sm py-4 text-center">
                    결과 확정이 필요한 경기가 없습니다.
                </div>
            {/if}
        </div>

        <!-- Right Container -->
        <div
            class="flex-1 flex flex-col overflow-auto min-h-0 min-w-0 relative p-[1.875rem] py-6 bg-white gap-6"
        >
            {#if activeResultMatch}
                <!-- Reusing MatchLogPanel from Record Page for simple view -->
                <div class="w-full flex justify-center">
                    <MatchLogPanel activeMatch={activeResultMatch} />
                </div>

                <!-- Winner Selection Form -->
                <div
                    class="w-full flex flex-col gap-4 max-w-2xl mx-auto border-t border-zinc-100 pt-6"
                >
                    <h3
                        class="font-pretendard font-bold text-lg text-center text-zinc-800 m-0"
                    >
                        승리 팀 확정하기
                    </h3>
                    <p class="text-sm text-zinc-500 text-center m-0">
                        위 기록을 바탕으로 어느 팀을 승리 팀으로
                        기록하시겠습니까? (이 결정은 되돌릴 수 없습니다)
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
                                class="w-full py-4 bg-white border-2 border-zinc-200 hover:border-amber-500 hover:bg-amber-50 rounded-xl font-bold text-lg transition-all"
                            >
                                {activeResultMatch.classA}반 승리
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
                                class="w-full py-4 bg-white border-2 border-zinc-200 hover:border-amber-500 hover:bg-amber-50 rounded-xl font-bold text-lg transition-all"
                            >
                                {activeResultMatch.classB}반 승리
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
                            class="w-full py-[0.875rem] border-2 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 rounded-xl font-bold text-lg text-zinc-500 hover:text-zinc-700 transition-all disabled:opacity-50"
                        >
                            결과 없음 (양 팀 탈락)
                        </button>
                    </form>
                </div>
            {:else}
                <div
                    class="flex items-center justify-center w-full h-full py-12"
                >
                    <p
                        class="font-pretendard font-normal text-zinc-400 text-[0.875rem] m-0 text-center"
                    >
                        좌측 메뉴에서 매치를 선택하세요.
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
