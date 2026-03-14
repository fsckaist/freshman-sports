<script lang="ts">
    import { enhance } from "$app/forms";
    import Plus from "@gravity-ui/icons/svgs/plus.svg?raw";
    import Minus from "@gravity-ui/icons/svgs/minus.svg?raw";

    let { activeMatch } = $props();

    let isSubmitting = $state(false);
    let showForfeitConfirm = $state(false);
    let showStartConfirm = $state(false);
    let showEndConfirm = $state(false);
    let showDetailsModal = $state(false);

    // Detailed Score State
    // We'll manage state for Team A and Team B
    let scoreDataA = $state({
        FirstScore: 0,
        FirstFoul: 0,
        SecondScore: 0,
        SecondFoul: 0,
        PenScore: 0,
    });
    let scoreDataB = $state({
        FirstScore: 0,
        FirstFoul: 0,
        SecondScore: 0,
        SecondFoul: 0,
        PenScore: 0,
    });

    let cardsA: Record<string, number> = $state({});
    let cardsB: Record<string, number> = $state({});

    interface DetailedNotes {
        teamA: { scores: typeof scoreDataA; cards: Record<string, number> };
        teamB: { scores: typeof scoreDataB; cards: Record<string, number> };
    }

    function createDefaultNotes(): DetailedNotes {
        return {
            teamA: {
                scores: {
                    FirstScore: 0,
                    FirstFoul: 0,
                    SecondScore: 0,
                    SecondFoul: 0,
                    PenScore: 0,
                },
                cards: {},
            },
            teamB: {
                scores: {
                    FirstScore: 0,
                    FirstFoul: 0,
                    SecondScore: 0,
                    SecondFoul: 0,
                    PenScore: 0,
                },
                cards: {},
            },
        };
    }

    const parsedNotes = $derived(
        (() => {
            const defaultNotes = createDefaultNotes();
            try {
                if (!activeMatch.matchNotes) return defaultNotes;
                const parsed = JSON.parse(activeMatch.matchNotes);
                if (typeof parsed !== "object" || parsed === null)
                    return defaultNotes;

                // Ensure teamA and teamB exist with expected structure
                return {
                    teamA: {
                        scores: {
                            ...defaultNotes.teamA.scores,
                            ...(parsed.teamA?.scores || {}),
                        },
                        cards: parsed.teamA?.cards || {},
                    },
                    teamB: {
                        scores: {
                            ...defaultNotes.teamB.scores,
                            ...(parsed.teamB?.scores || {}),
                        },
                        cards: parsed.teamB?.cards || {},
                    },
                } as DetailedNotes;
            } catch {
                return defaultNotes;
            }
        })(),
    );

    $effect(() => {
        // Initialize cards state for any newly loaded players
        activeMatch.attendance.teamA.forEach((u: any) => {
            if (cardsA[u.name] === undefined) cardsA[u.name] = 0;
        });
        activeMatch.attendance.teamB.forEach((u: any) => {
            if (cardsB[u.name] === undefined) cardsB[u.name] = 0;
        });
    });

    // Computed comma separated strings for the summary section
    const teamAPlayers = $derived(
        activeMatch.attendance.teamA.map((u: any) => u.name).join(", ") ||
            "없음",
    );
    const teamBPlayers = $derived(
        activeMatch.attendance.teamB.map((u: any) => u.name).join(", ") ||
            "없음",
    );

    const isSatisfied = $derived(
        (activeMatch.attendance.teamATotal === 0 ||
            activeMatch.attendance.teamA.length >=
                activeMatch.attendance.teamATotal) &&
            (activeMatch.attendance.teamBTotal === 0 ||
                activeMatch.attendance.teamB.length >=
                    activeMatch.attendance.teamBTotal),
    );

    // Calculate total scores to send to the server
    const totalScoreA = $derived(
        scoreDataA.FirstScore + scoreDataA.SecondScore + scoreDataA.PenScore,
    );
    const totalScoreB = $derived(
        scoreDataB.FirstScore + scoreDataB.SecondScore + scoreDataB.PenScore,
    );

    const matchNotesJson = $derived(
        JSON.stringify({
            teamA: { scores: scoreDataA, cards: cardsA },
            teamB: { scores: scoreDataB, cards: cardsB },
        }),
    );

    // Helper to render IncDec
    function updateScore(team: "A" | "B", field: string, delta: number) {
        if (team === "A") {
            const val = scoreDataA[field as keyof typeof scoreDataA] + delta;
            if (val >= 0) scoreDataA = { ...scoreDataA, [field]: val };
        } else {
            const val = scoreDataB[field as keyof typeof scoreDataB] + delta;
            if (val >= 0) scoreDataB = { ...scoreDataB, [field]: val };
        }
    }

    // Helper to toggle Card status: Default(0) -> Yellow(1) -> Red(2) -> Default(0)
    function toggleCard(team: "A" | "B", playerName: string) {
        if (team === "A") {
            const current = cardsA[playerName] || 0;
            cardsA = { ...cardsA, [playerName]: (current + 1) % 3 };
        } else {
            const current = cardsB[playerName] || 0;
            cardsB = { ...cardsB, [playerName]: (current + 1) % 3 };
        }
    }
</script>

{#if showDetailsModal}
    <div
        class="fixed inset-0 bg-zinc-800/80 flex items-center justify-center z-[9999] p-4"
        style="backdrop-filter: blur(4px);"
    >
        <div
            class="bg-white flex flex-col gap-6 items-center justify-start overflow-clip p-6 relative rounded-[1.25rem] shadow-2xl shrink-0 w-[45rem] max-w-full max-h-[90vh] overflow-y-auto border border-zinc-200"
        >
            <div class="w-full flex justify-between items-center">
                <h2 class="text-[1.5rem] font-bold text-zinc-800">
                    경기 상세 정보
                </h2>
                <button
                    onclick={() => (showDetailsModal = false)}
                    class="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                    aria-label="닫기"
                    title="닫기"
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        ><line x1="18" y1="6" x2="6" y2="18"></line><line
                            x1="6"
                            y1="6"
                            x2="18"
                            y2="18"
                        ></line></svg
                    >
                </button>
            </div>

            <!-- Score Comparison Table -->
            <div class="w-full grid grid-cols-3 gap-4">
                <div class="col-span-1 flex flex-col items-center">
                    <span class="text-zinc-500 text-sm mb-1"
                        >{activeMatch.classA}반</span
                    >
                    <span class="text-3xl font-black text-zinc-800"
                        >{activeMatch.scoreA}</span
                    >
                </div>
                <div class="col-span-1 flex items-center justify-center">
                    <span class="text-2xl font-bold text-zinc-300">VS</span>
                </div>
                <div class="col-span-1 flex flex-col items-center">
                    <span class="text-zinc-500 text-sm mb-1"
                        >{activeMatch.classB}반</span
                    >
                    <span class="text-3xl font-black text-zinc-800"
                        >{activeMatch.scoreB}</span
                    >
                </div>
            </div>

            <div class="w-full h-px bg-zinc-200"></div>

            <!-- Detail Tabs -->
            <div class="w-full grid grid-cols-2 gap-8">
                <!-- Team A Details -->
                <div class="flex flex-col gap-4">
                    <h3 class="text-lg font-bold text-zinc-700">
                        {activeMatch.classA}반 상세
                    </h3>

                    <div
                        class="bg-zinc-50 rounded-xl border border-zinc-100 p-4"
                    >
                        <div class="grid grid-cols-2 gap-y-2 text-sm">
                            <span class="text-zinc-400">전반전 득점</span>
                            <span class="font-bold text-right"
                                >{parsedNotes.teamA.scores.FirstScore}</span
                            >
                            <span class="text-zinc-400">전반전 파울</span>
                            <span class="font-bold text-right"
                                >{parsedNotes.teamA.scores.FirstFoul}</span
                            >
                            <div
                                class="col-span-2 h-px bg-zinc-200/50 my-1"
                            ></div>
                            <span class="text-zinc-400">후반전 득점</span>
                            <span class="font-bold text-right"
                                >{parsedNotes.teamA.scores.SecondScore}</span
                            >
                            <span class="text-zinc-400">후반전 파울</span>
                            <span class="font-bold text-right"
                                >{parsedNotes.teamA.scores.SecondFoul}</span
                            >
                            <div
                                class="col-span-2 h-px bg-zinc-200/50 my-1"
                            ></div>
                            <span class="text-zinc-400">승부차기</span>
                            <span class="font-bold text-right"
                                >{parsedNotes.teamA.scores.PenScore}</span
                            >
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <span class="text-sm font-bold text-zinc-500"
                            >경고 및 퇴장</span
                        >
                        <div class="flex flex-wrap gap-2">
                            {#each Object.entries(parsedNotes.teamA.cards) as [name, type]}
                                {#if type > 0}
                                    <div
                                        class="px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 {type ===
                                        1
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-red-100 text-red-700'}"
                                    >
                                        <div
                                            class="w-2 h-3 rounded-sm {type ===
                                            1
                                                ? 'bg-amber-500'
                                                : 'bg-red-500'}"
                                        ></div>
                                        {name}
                                    </div>
                                {/if}
                            {/each}
                        </div>
                    </div>
                </div>

                <!-- Team B Details -->
                <div class="flex flex-col gap-4">
                    <h3 class="text-lg font-bold text-zinc-700">
                        {activeMatch.classB}반 상세
                    </h3>

                    <div
                        class="bg-zinc-50 rounded-xl border border-zinc-100 p-4"
                    >
                        <div class="grid grid-cols-2 gap-y-2 text-sm">
                            <span class="text-zinc-400">전반전 득점</span>
                            <span class="font-bold text-right"
                                >{parsedNotes.teamB.scores.FirstScore}</span
                            >
                            <span class="text-zinc-400">전반전 파울</span>
                            <span class="font-bold text-right"
                                >{parsedNotes.teamB.scores.FirstFoul}</span
                            >
                            <div
                                class="col-span-2 h-px bg-zinc-200/50 my-1"
                            ></div>
                            <span class="text-zinc-400">후반전 득점</span>
                            <span class="font-bold text-right"
                                >{parsedNotes.teamB.scores.SecondScore}</span
                            >
                            <span class="text-zinc-400">후반전 파울</span>
                            <span class="font-bold text-right"
                                >{parsedNotes.teamB.scores.SecondFoul}</span
                            >
                            <div
                                class="col-span-2 h-px bg-zinc-200/50 my-1"
                            ></div>
                            <span class="text-zinc-400">승부차기</span>
                            <span class="font-bold text-right"
                                >{parsedNotes.teamB.scores.PenScore}</span
                            >
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <span class="text-sm font-bold text-zinc-500"
                            >경고 및 퇴장</span
                        >
                        <div class="flex flex-wrap gap-2">
                            {#each Object.entries(parsedNotes.teamB.cards) as [name, type]}
                                {#if type > 0}
                                    <div
                                        class="px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 {type ===
                                        1
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-red-100 text-red-700'}"
                                    >
                                        <div
                                            class="w-2 h-3 rounded-sm {type ===
                                            1
                                                ? 'bg-amber-500'
                                                : 'bg-red-500'}"
                                        ></div>
                                        {name}
                                    </div>
                                {/if}
                            {/each}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Additional Notes / Forfeit Info -->
            {#if activeMatch.matchNotes}
                {@const rawNotes = (() => {
                    try {
                        const parsed = JSON.parse(activeMatch.matchNotes);
                        if (parsed.note) return parsed.note;
                        if (!parsed.teamA && !parsed.teamB)
                            return activeMatch.matchNotes;
                        return null;
                    } catch {
                        return activeMatch.matchNotes;
                    }
                })()}

                {#if rawNotes}
                    <div class="w-full h-px bg-zinc-200"></div>
                    <div class="w-full flex flex-col gap-2">
                        <h3 class="text-lg font-bold text-zinc-700">
                            기타 정보
                        </h3>
                        <div
                            class="bg-zinc-100 rounded-xl p-4 text-zinc-600 text-[1rem] leading-relaxed break-keep"
                        >
                            {rawNotes}
                        </div>
                    </div>
                {/if}
            {/if}

            <button
                onclick={() => {
                    console.log("Confirm clicked");
                    showDetailsModal = false;
                }}
                class="w-full mt-4 py-3 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors"
            >
                확인
            </button>
        </div>
    </div>
{/if}

<!-- We need a hidden form to submit the complex data -->
{#if activeMatch.status === "ONGOING"}
    <form
        id="finalizeForm"
        method="POST"
        action="?/finalizeMatch"
        use:enhance={() => {
            isSubmitting = true;
            return async ({ update }) => {
                isSubmitting = false;
                update();
            };
        }}
    >
        <input type="hidden" name="matchId" value={activeMatch.id} />
        <input type="hidden" name="scoreA" value={totalScoreA} />
        <input type="hidden" name="scoreB" value={totalScoreB} />
        <input type="hidden" name="matchNotes" value={matchNotesJson} />
    </form>
{/if}

<div
    class="bg-white flex flex-col gap-[0.625rem] items-start min-h-[25rem] overflow-clip p-[1.25rem] relative rounded-[1.25rem] shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] w-full h-full"
>
    <div
        class="content-stretch flex flex-[1_0_0] gap-[0.625rem] items-center min-h-px min-w-px relative w-full overflow-hidden"
    >
        <!-- Team A Column -->
        <div
            class="content-stretch flex flex-[1_0_0] flex-col gap-[0.625rem] h-full items-center min-h-px min-w-px overflow-y-auto relative rounded-[1.25rem] px-2"
        >
            <p
                class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-zinc-800 text-[1.5rem] whitespace-nowrap mt-2"
            >
                {activeMatch.classA ? `${activeMatch.classA}반` : "Unknown"}
            </p>
            <div class="h-px w-full bg-zinc-200 shrink-0 my-1"></div>

            {#if activeMatch.status === "FINISHED"}
                <div class="text-[3.375rem] font-black text-zinc-800 my-4">
                    {activeMatch.scoreA}
                </div>
            {:else if activeMatch.status === "ONGOING"}
                <!-- Detailed Scoring UI -> Team A -->
                <div class="w-full flex-col gap-4 py-2 flex items-start">
                    <!-- First Half -->
                    <div class="w-full flex flex-col gap-1">
                        <p class="text-zinc-500 font-medium text-[1rem]">
                            전반
                        </p>
                        <div
                            class="w-full border border-zinc-200 rounded-xl flex items-center h-20 overflow-hidden"
                        >
                            <div
                                class="bg-zinc-100 flex flex-col items-center justify-center gap-2 px-4 h-full shrink-0 border-r border-zinc-200"
                            >
                                <span class="text-sm text-zinc-600">득점</span>
                                <span class="text-sm text-zinc-600">파울</span>
                            </div>
                            <!-- Controls -->
                            <div class="flex-1 flex flex-col h-full bg-white">
                                <div
                                    class="flex-1 flex items-center justify-between px-4 border-b border-zinc-100"
                                >
                                    <button
                                        type="button"
                                        onclick={() =>
                                            updateScore("A", "FirstScore", -1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Minus}</button
                                    >
                                    <span class="font-medium text-zinc-700"
                                        >{scoreDataA.FirstScore}</span
                                    >
                                    <button
                                        type="button"
                                        onclick={() =>
                                            updateScore("A", "FirstScore", 1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Plus}</button
                                    >
                                </div>
                                <div
                                    class="flex-1 flex items-center justify-between px-4"
                                >
                                    <button
                                        type="button"
                                        onclick={() =>
                                            updateScore("A", "FirstFoul", -1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Minus}</button
                                    >
                                    <span class="font-medium text-zinc-700"
                                        >{scoreDataA.FirstFoul}</span
                                    >
                                    <button
                                        type="button"
                                        onclick={() =>
                                            updateScore("A", "FirstFoul", 1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Plus}</button
                                    >
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Second Half -->
                    <div class="w-full flex flex-col gap-1 mt-2">
                        <p class="text-zinc-500 font-medium text-[1rem]">
                            후반
                        </p>
                        <div
                            class="w-full border border-zinc-200 rounded-xl flex items-center h-20 overflow-hidden"
                        >
                            <div
                                class="bg-zinc-100 flex flex-col items-center justify-center gap-2 px-4 h-full shrink-0 border-r border-zinc-200"
                            >
                                <span class="text-sm text-zinc-600">득점</span>
                                <span class="text-sm text-zinc-600">파울</span>
                            </div>
                            <div class="flex-1 flex flex-col h-full bg-white">
                                <div
                                    class="flex-1 flex items-center justify-between px-4 border-b border-zinc-100"
                                >
                                    <button
                                        type="button"
                                        onclick={() =>
                                            updateScore("A", "SecondScore", -1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Minus}</button
                                    >
                                    <span class="font-medium text-zinc-700"
                                        >{scoreDataA.SecondScore}</span
                                    >
                                    <button
                                        type="button"
                                        onclick={() =>
                                            updateScore("A", "SecondScore", 1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Plus}</button
                                    >
                                </div>
                                <div
                                    class="flex-1 flex items-center justify-between px-4"
                                >
                                    <button
                                        type="button"
                                        onclick={() =>
                                            updateScore("A", "SecondFoul", -1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Minus}</button
                                    >
                                    <span class="font-medium text-zinc-700"
                                        >{scoreDataA.SecondFoul}</span
                                    >
                                    <button
                                        type="button"
                                        onclick={() =>
                                            updateScore("A", "SecondFoul", 1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Plus}</button
                                    >
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Penalty Shootout -->
                    <div class="w-full flex flex-col gap-1 mt-2">
                        <p class="text-zinc-500 font-medium text-[1rem]">
                            승부차기
                        </p>
                        <div
                            class="w-full border border-zinc-200 rounded-xl flex items-center h-10 overflow-hidden"
                        >
                            <div
                                class="bg-zinc-100 flex flex-col items-center justify-center px-4 h-full shrink-0 border-r border-zinc-200"
                            >
                                <span class="text-sm text-zinc-600">득점</span>
                            </div>
                            <div
                                class="flex-1 flex items-center justify-between px-4 bg-white h-full"
                            >
                                <button
                                    type="button"
                                    onclick={() =>
                                        updateScore("A", "PenScore", -1)}
                                    class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                    >{@html Minus}</button
                                >
                                <span class="font-medium text-zinc-700"
                                    >{scoreDataA.PenScore}</span
                                >
                                <button
                                    type="button"
                                    onclick={() =>
                                        updateScore("A", "PenScore", 1)}
                                    class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                    >{@html Plus}</button
                                >
                            </div>
                        </div>
                    </div>

                    <!-- Cards -->
                    <div class="w-full flex flex-col gap-1 mt-2">
                        <p class="text-zinc-500 font-medium text-[1rem]">
                            경고 및 퇴장
                        </p>
                        <div
                            class="w-full border border-zinc-200 p-[0.9375rem] rounded-[1.25rem] gap-[0.3125rem] grid grid-cols-3"
                        >
                            {#each activeMatch.attendance.teamA as player}
                                <button
                                    type="button"
                                    onclick={() => toggleCard("A", player.name)}
                                    class="bg-white border border-[#e4e4e7] border-solid content-stretch flex flex-col items-center justify-center px-[0.625rem] py-[0.3125rem] relative rounded-[0.5rem] transition-colors hover:bg-zinc-50"
                                >
                                    <p
                                        class="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[0.875rem] whitespace-nowrap {cardsA[
                                            player.name
                                        ] === 2
                                            ? 'text-red-500'
                                            : cardsA[player.name] === 1
                                              ? 'text-amber-500'
                                              : 'text-zinc-600'}"
                                    >
                                        {player.name}
                                    </p>
                                </button>
                            {/each}
                            {#if activeMatch.attendance.teamA.length === 0}
                                <p
                                    class="text-xs text-zinc-400 col-span-3 text-center py-2"
                                >
                                    등록된 선수가 없습니다.
                                </p>
                            {/if}
                        </div>
                    </div>
                </div>
            {/if}

            <p
                class="font-['Pretendard_Variable'] font-medium leading-[1.5rem] min-w-full relative shrink-0 text-zinc-800 text-[1.125rem] text-center w-full pt-4"
            >
                출전 선수
            </p>
            <p
                class="font-['Pretendard_Variable'] font-medium leading-relaxed min-w-full relative shrink-0 text-zinc-500 text-[1rem] text-center w-full pb-4 whitespace-normal break-keep"
            >
                {teamAPlayers}
            </p>
        </div>

        <!-- Vertical Divider -->
        <div
            class="flex h-full w-px bg-zinc-200 items-center justify-center relative self-center shrink-0 mx-2"
        ></div>

        <!-- Team B Column -->
        <div
            class="content-stretch flex flex-[1_0_0] flex-col gap-[0.625rem] h-full items-center min-h-px min-w-px overflow-y-auto relative rounded-[1.25rem] px-2"
        >
            <p
                class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-zinc-800 text-[1.5rem] whitespace-nowrap mt-2"
            >
                {activeMatch.classB ? `${activeMatch.classB}반` : "Unknown"}
            </p>
            <div class="h-px w-full bg-zinc-200 shrink-0 my-1"></div>

            {#if activeMatch.status === "FINISHED"}
                <div class="text-[3.375rem] font-black text-zinc-800 my-4">
                    {activeMatch.scoreB}
                </div>
            {:else if activeMatch.status === "ONGOING"}
                <!-- Detailed Scoring UI -> Team B -->
                <div class="w-full flex-col gap-4 py-2 flex items-start">
                    <!-- First Half -->
                    <div class="w-full flex flex-col gap-1">
                        <p class="text-zinc-500 font-medium text-[1rem]">
                            전반
                        </p>
                        <div
                            class="w-full border border-zinc-200 rounded-xl flex items-center h-20 overflow-hidden"
                        >
                            <div
                                class="bg-zinc-100 flex flex-col items-center justify-center gap-2 px-4 h-full shrink-0 border-r border-zinc-200"
                            >
                                <span class="text-sm text-zinc-600">득점</span>
                                <span class="text-sm text-zinc-600">파울</span>
                            </div>
                            <!-- Controls -->
                            <div class="flex-1 flex flex-col h-full bg-white">
                                <div
                                    class="flex-1 flex items-center justify-between px-4 border-b border-zinc-100"
                                >
                                    <button
                                        type="button"
                                        onclick={() =>
                                            updateScore("B", "FirstScore", -1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Minus}</button
                                    >
                                    <span class="font-medium text-zinc-700"
                                        >{scoreDataB.FirstScore}</span
                                    >
                                    <button
                                        type="button"
                                        onclick={() =>
                                            updateScore("B", "FirstScore", 1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Plus}</button
                                    >
                                </div>
                                <div
                                    class="flex-1 flex items-center justify-between px-4"
                                >
                                    <button
                                        type="button"
                                        onclick={() =>
                                            updateScore("B", "FirstFoul", -1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Minus}</button
                                    >
                                    <span class="font-medium text-zinc-700"
                                        >{scoreDataB.FirstFoul}</span
                                    >
                                    <button
                                        type="button"
                                        onclick={() =>
                                            updateScore("B", "FirstFoul", 1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Plus}</button
                                    >
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Second Half -->
                    <div class="w-full flex flex-col gap-1 mt-2">
                        <p class="text-zinc-500 font-medium text-[1rem]">
                            후반
                        </p>
                        <div
                            class="w-full border border-zinc-200 rounded-xl flex items-center h-20 overflow-hidden"
                        >
                            <div
                                class="bg-zinc-100 flex flex-col items-center justify-center gap-2 px-4 h-full shrink-0 border-r border-zinc-200"
                            >
                                <span class="text-sm text-zinc-600">득점</span>
                                <span class="text-sm text-zinc-600">파울</span>
                            </div>
                            <div class="flex-1 flex flex-col h-full bg-white">
                                <div
                                    class="flex-1 flex items-center justify-between px-4 border-b border-zinc-100"
                                >
                                    <button
                                        type="button"
                                        onclick={() =>
                                            updateScore("B", "SecondScore", -1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Minus}</button
                                    >
                                    <span class="font-medium text-zinc-700"
                                        >{scoreDataB.SecondScore}</span
                                    >
                                    <button
                                        type="button"
                                        onclick={() =>
                                            updateScore("B", "SecondScore", 1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Plus}</button
                                    >
                                </div>
                                <div
                                    class="flex-1 flex items-center justify-between px-4"
                                >
                                    <button
                                        type="button"
                                        onclick={() =>
                                            updateScore("B", "SecondFoul", -1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Minus}</button
                                    >
                                    <span class="font-medium text-zinc-700"
                                        >{scoreDataB.SecondFoul}</span
                                    >
                                    <button
                                        type="button"
                                        onclick={() =>
                                            updateScore("B", "SecondFoul", 1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Plus}</button
                                    >
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Penalty Shootout -->
                    <div class="w-full flex flex-col gap-1 mt-2">
                        <p class="text-zinc-500 font-medium text-[1rem]">
                            승부차기
                        </p>
                        <div
                            class="w-full border border-zinc-200 rounded-xl flex items-center h-10 overflow-hidden"
                        >
                            <div
                                class="bg-zinc-100 flex flex-col items-center justify-center px-4 h-full shrink-0 border-r border-zinc-200"
                            >
                                <span class="text-sm text-zinc-600">득점</span>
                            </div>
                            <div
                                class="flex-1 flex items-center justify-between px-4 bg-white h-full"
                            >
                                <button
                                    type="button"
                                    onclick={() =>
                                        updateScore("B", "PenScore", -1)}
                                    class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                    >{@html Minus}</button
                                >
                                <span class="font-medium text-zinc-700"
                                    >{scoreDataB.PenScore}</span
                                >
                                <button
                                    type="button"
                                    onclick={() =>
                                        updateScore("B", "PenScore", 1)}
                                    class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                    >{@html Plus}</button
                                >
                            </div>
                        </div>
                    </div>

                    <!-- Cards -->
                    <div class="w-full flex flex-col gap-1 mt-2">
                        <p class="text-zinc-500 font-medium text-[1rem]">
                            경고 및 퇴장
                        </p>
                        <div
                            class="w-full border border-zinc-200 p-[0.9375rem] rounded-[1.25rem] gap-[0.3125rem] grid grid-cols-3"
                        >
                            {#each activeMatch.attendance.teamB as player}
                                <button
                                    type="button"
                                    onclick={() => toggleCard("B", player.name)}
                                    class="bg-white border border-[#e4e4e7] border-solid content-stretch flex flex-col items-center justify-center px-[0.625rem] py-[0.3125rem] relative rounded-[0.5rem] transition-colors hover:bg-zinc-50"
                                >
                                    <p
                                        class="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[0.875rem] whitespace-nowrap {cardsB[
                                            player.name
                                        ] === 2
                                            ? 'text-red-500'
                                            : cardsB[player.name] === 1
                                              ? 'text-amber-500'
                                              : 'text-zinc-600'}"
                                    >
                                        {player.name}
                                    </p>
                                </button>
                            {/each}
                            {#if activeMatch.attendance.teamB.length === 0}
                                <p
                                    class="text-xs text-zinc-400 col-span-3 text-center py-2"
                                >
                                    등록된 선수가 없습니다.
                                </p>
                            {/if}
                        </div>
                    </div>
                </div>
            {/if}

            <p
                class="font-['Pretendard_Variable'] font-medium leading-[1.5rem] min-w-full relative shrink-0 text-zinc-800 text-[1.125rem] text-center w-full pt-4"
            >
                출전 선수
            </p>
            <p
                class="font-['Pretendard_Variable'] font-medium leading-relaxed min-w-full relative shrink-0 text-zinc-500 text-[1rem] text-center w-full pb-4 whitespace-normal break-keep"
            >
                {teamBPlayers}
            </p>
        </div>
    </div>

    <!-- Action Button -->
    <div class="w-full mt-4 shrink-0">
        {#if activeMatch.status === "PENDING_SCHEDULE" || activeMatch.status === "SCHEDULED"}
            {#if isSatisfied}
                <button
                    onclick={() => (showStartConfirm = true)}
                    class="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-colors content-stretch flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-[0.5rem] relative rounded-[0.9375rem] shrink-0 w-full"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-[1rem] text-white whitespace-nowrap"
                    >
                        경기 시작하기
                    </p>
                </button>
            {:else}
                <button
                    onclick={() => (showForfeitConfirm = true)}
                    class="bg-zinc-500 hover:bg-zinc-600 active:bg-zinc-800 transition-colors content-stretch flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-[0.5rem] relative rounded-[0.9375rem] shrink-0 w-full"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-[1rem] text-white whitespace-nowrap"
                    >
                        기권패 / 몰수패
                    </p>
                </button>
            {/if}
        {:else if activeMatch.status === "ONGOING"}
            <!-- Form submit button mapped from the hidden input form setup -->
            <button
                disabled={isSubmitting}
                onclick={() => (showEndConfirm = true)}
                class="bg-zinc-500 hover:bg-zinc-600 active:bg-zinc-800 transition-colors content-stretch flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-[0.5rem] relative rounded-[0.9375rem] shrink-0 w-full disabled:opacity-50"
            >
                <p
                    class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-[1rem] text-white whitespace-nowrap"
                >
                    경기 종료하기
                </p>
            </button>
        {:else if activeMatch.status === "FINISHED"}
            <div class="flex gap-2 w-full">
                <div
                    class="bg-zinc-100 content-stretch flex flex-4 h-[3.125rem] items-center justify-center px-[2.1875rem] py-[0.5rem] relative rounded-[0.9375rem]"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-[1rem] text-zinc-500 whitespace-nowrap"
                    >
                        종료된 경기입니다
                    </p>
                </div>
                <button
                    type="button"
                    onclick={() => {
                        showDetailsModal = true;
                    }}
                    class="bg-zinc-800 flex-1 hover:bg-zinc-700 text-white font-bold content-stretch flex flex-col h-[3.125rem] items-center justify-center px-[1.5rem] py-[0.5rem] relative rounded-[0.9375rem] shrink-0"
                >
                    상세 정보
                </button>
            </div>
        {/if}
    </div>
</div>

{#if showForfeitConfirm}
    <div
        class="fixed inset-0 bg-zinc-800/30 flex items-center justify-center z-50 p-4"
        style="backdrop-filter: blur(2px);"
    >
        <div
            class="bg-zinc-50 flex flex-col gap-2.5 items-center justify-center overflow-clip p-5 relative rounded-[1.25rem] shadow-[0_0_1.875rem_0_rgba(0,0,0,0.05)] shrink-0 w-[31.3125rem] max-w-full"
        >
            <div
                class="flex flex-col gap-5 items-center justify-center p-[3.125rem] relative shrink-0 w-full text-center"
            >
                <p
                    class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-zinc-800 text-[1.5rem]"
                >
                    정말로 기권패 / 몰수패 처리가 맞나요?
                </p>
                <p
                    class="font-['Pretendard_Variable'] font-medium relative shrink-0 text-zinc-600 text-[1.125rem]"
                >
                    시스템 상 결과를 번복할 수 없습니다.
                </p>
            </div>
            <div
                class="flex gap-2.5 items-start justify-center relative shrink-0 w-full sm:flex-row flex-col"
            >
                <button
                    onclick={() => (showForfeitConfirm = false)}
                    class="bg-zinc-500 hover:bg-zinc-600 active:bg-zinc-800 transition-colors flex-1 flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-2 relative rounded-[0.9375rem] w-full"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-[1rem] text-white whitespace-nowrap"
                    >
                        돌아가기
                    </p>
                </button>
                <form
                    method="POST"
                    action="?/forfeitMatch"
                    use:enhance={() => {
                        isSubmitting = true;
                        return async ({ update }) => {
                            isSubmitting = false;
                            showForfeitConfirm = false;
                            update();
                        };
                    }}
                    class="flex-1 w-full"
                >
                    <input
                        type="hidden"
                        name="matchId"
                        value={activeMatch.id}
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        class="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-colors w-full flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-2 relative rounded-[0.9375rem] disabled:opacity-50"
                    >
                        <p
                            class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-[1rem] text-white whitespace-nowrap"
                        >
                            기권패 / 몰수패 처리하기
                        </p>
                    </button>
                </form>
            </div>
        </div>
    </div>
{/if}

{#if showStartConfirm}
    <div
        class="fixed inset-0 bg-zinc-800/30 flex items-center justify-center z-50 p-4"
        style="backdrop-filter: blur(2px);"
    >
        <div
            class="bg-zinc-50 flex flex-col gap-2.5 items-center justify-center overflow-clip p-5 relative rounded-[1.25rem] shadow-[0_0_1.875rem_0_rgba(0,0,0,0.05)] shrink-0 w-[31.3125rem] max-w-full"
        >
            <div
                class="flex flex-col gap-5 items-center justify-center p-[3.125rem] relative shrink-0 w-full text-center"
            >
                <p
                    class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-zinc-800 text-[1.5rem]"
                >
                    정말로 경기를 시작할까요?
                </p>
                <p
                    class="font-['Pretendard_Variable'] font-medium relative shrink-0 text-zinc-600 text-[1.125rem]"
                >
                    시스템 상 결과를 번복할 수 없습니다.
                </p>
            </div>
            <div
                class="flex gap-2.5 items-center justify-center relative shrink-0 w-full sm:flex-row flex-col"
            >
                <button
                    onclick={() => (showStartConfirm = false)}
                    class="bg-zinc-500 hover:bg-zinc-600 active:bg-zinc-800 transition-colors flex-1 flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-2 relative rounded-[0.9375rem] w-full"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-[1rem] text-white whitespace-nowrap"
                    >
                        돌아가기
                    </p>
                </button>

                <form
                    method="POST"
                    action="?/startMatch"
                    use:enhance={() => {
                        isSubmitting = true;
                        return async ({ update }) => {
                            isSubmitting = false;
                            showStartConfirm = false;
                            update();
                        };
                    }}
                    class="contents"
                >
                    <input
                        type="hidden"
                        name="matchId"
                        value={activeMatch.id}
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        class="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-colors flex-1 flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-2 relative rounded-[0.9375rem] w-full disabled:opacity-50"
                    >
                        <p
                            class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-[1rem] text-white whitespace-nowrap"
                        >
                            경기 시작하기
                        </p>
                    </button>
                </form>
            </div>
        </div>
    </div>
{/if}

{#if showEndConfirm}
    <div
        class="fixed inset-0 bg-zinc-800/30 flex items-center justify-center z-50 p-4"
        style="backdrop-filter: blur(2px);"
    >
        <div
            class="bg-zinc-50 flex flex-col gap-2.5 items-center justify-center overflow-clip p-5 relative rounded-[1.25rem] shadow-[0_0_1.875rem_0_rgba(0,0,0,0.05)] shrink-0 w-[35.5625rem] max-w-full"
        >
            <div
                class="flex flex-col items-center justify-center p-[3.125rem] pb-[3.125rem] relative shrink-0 w-full text-center"
            >
                <p
                    class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-zinc-800 text-[1.5rem]"
                >
                    정말로 경기가 끝났나요?
                </p>
                <div
                    class="flex flex-col mt-5 gap-1.5 items-center justify-center"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-medium relative shrink-0 text-zinc-600 text-[1.125rem]"
                    >
                        시스템 상 결과를 번복할 수 없습니다.
                    </p>
                    <p
                        class="font-['Pretendard_Variable'] font-medium relative shrink-0 text-red-600 text-[1.125rem] break-keep leading-tight"
                    >
                        반드시 모든 선수의 결과 확인을 받은 후 경기를
                        종료해주세요.
                    </p>
                </div>
            </div>
            <div
                class="flex gap-2.5 items-center justify-center relative shrink-0 w-full sm:flex-row flex-col"
            >
                <button
                    onclick={() => (showEndConfirm = false)}
                    class="bg-zinc-500 hover:bg-zinc-600 active:bg-zinc-800 transition-colors flex-1 flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-2 relative rounded-[0.9375rem] w-full"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-[1rem] text-white whitespace-nowrap"
                    >
                        돌아가기
                    </p>
                </button>
                <button
                    disabled={isSubmitting}
                    onclick={() => {
                        showEndConfirm = false;
                        const form = document.querySelector(
                            "#finalizeForm",
                        ) as HTMLFormElement | null;
                        if (form) form.requestSubmit();
                    }}
                    class="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-colors w-full flex-1 flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-2 relative rounded-[0.9375rem] disabled:opacity-50"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-[1rem] text-white whitespace-nowrap"
                    >
                        경기 종료하기
                    </p>
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
</style>
