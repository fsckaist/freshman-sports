<script lang="ts">
    import { enhance } from "$app/forms";
    import Plus from "@gravity-ui/icons/svgs/plus.svg?raw";
    import Minus from "@gravity-ui/icons/svgs/minus.svg?raw";

    export let activeMatch;

    let isSubmitting = false;
    let showForfeitConfirm = false;
    let showStartConfirm = false;
    let showEndConfirm = false;

    // Detailed Score State
    // We'll manage state for Team A and Team B
    let scoreDataA = {
        FirstScore: 0,
        FirstFoul: 0,
        SecondScore: 0,
        SecondFoul: 0,
        PenScore: 0,
    };
    let scoreDataB = {
        FirstScore: 0,
        FirstFoul: 0,
        SecondScore: 0,
        SecondFoul: 0,
        PenScore: 0,
    };

    // Cards are tracked individually per player name
    // 0: Default, 1: Yellow, 2: Red
    let cardsA: Record<string, number> = {};
    let cardsB: Record<string, number> = {};

    $: {
        // Initialize cards state for any newly loaded players
        activeMatch.attendance.teamA.forEach((u: any) => {
            if (cardsA[u.name] === undefined) cardsA[u.name] = 0;
        });
        activeMatch.attendance.teamB.forEach((u: any) => {
            if (cardsB[u.name] === undefined) cardsB[u.name] = 0;
        });
    }

    // Computed comma separated strings for the summary section
    $: teamAPlayers =
        activeMatch.attendance.teamA.map((u: any) => u.name).join(", ") ||
        "없음";
    $: teamBPlayers =
        activeMatch.attendance.teamB.map((u: any) => u.name).join(", ") ||
        "없음";

    $: isSatisfied =
        (activeMatch.attendance.teamATotal === 0 ||
            activeMatch.attendance.teamA.length >=
                activeMatch.attendance.teamATotal) &&
        (activeMatch.attendance.teamBTotal === 0 ||
            activeMatch.attendance.teamB.length >=
                activeMatch.attendance.teamBTotal);

    // Calculate total scores to send to the server
    $: totalScoreA =
        scoreDataA.FirstScore + scoreDataA.SecondScore + scoreDataA.PenScore;
    $: totalScoreB =
        scoreDataB.FirstScore + scoreDataB.SecondScore + scoreDataB.PenScore;

    // Collect all detailed stats into a JSON string
    $: matchNotesJson = JSON.stringify({
        teamA: { scores: scoreDataA, cards: cardsA },
        teamB: { scores: scoreDataB, cards: cardsB },
    });

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
                                        on:click={() =>
                                            updateScore("A", "FirstScore", -1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Minus}</button
                                    >
                                    <span class="font-medium text-zinc-700"
                                        >{scoreDataA.FirstScore}</span
                                    >
                                    <button
                                        type="button"
                                        on:click={() =>
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
                                        on:click={() =>
                                            updateScore("A", "FirstFoul", -1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Minus}</button
                                    >
                                    <span class="font-medium text-zinc-700"
                                        >{scoreDataA.FirstFoul}</span
                                    >
                                    <button
                                        type="button"
                                        on:click={() =>
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
                                        on:click={() =>
                                            updateScore("A", "SecondScore", -1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Minus}</button
                                    >
                                    <span class="font-medium text-zinc-700"
                                        >{scoreDataA.SecondScore}</span
                                    >
                                    <button
                                        type="button"
                                        on:click={() =>
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
                                        on:click={() =>
                                            updateScore("A", "SecondFoul", -1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Minus}</button
                                    >
                                    <span class="font-medium text-zinc-700"
                                        >{scoreDataA.SecondFoul}</span
                                    >
                                    <button
                                        type="button"
                                        on:click={() =>
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
                                    on:click={() =>
                                        updateScore("A", "PenScore", -1)}
                                    class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                    >{@html Minus}</button
                                >
                                <span class="font-medium text-zinc-700"
                                    >{scoreDataA.PenScore}</span
                                >
                                <button
                                    type="button"
                                    on:click={() =>
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
                            class="w-full border border-zinc-200 p-[15px] rounded-[20px] gap-[5px] grid grid-cols-3"
                        >
                            {#each activeMatch.attendance.teamA as player}
                                <button
                                    type="button"
                                    on:click={() =>
                                        toggleCard("A", player.name)}
                                    class="bg-white border border-[#e4e4e7] border-solid content-stretch flex flex-col items-center justify-center px-[10px] py-[5px] relative rounded-[8px] transition-colors hover:bg-zinc-50"
                                >
                                    <p
                                        class="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[14px] whitespace-nowrap {cardsA[
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
                                        on:click={() =>
                                            updateScore("B", "FirstScore", -1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Minus}</button
                                    >
                                    <span class="font-medium text-zinc-700"
                                        >{scoreDataB.FirstScore}</span
                                    >
                                    <button
                                        type="button"
                                        on:click={() =>
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
                                        on:click={() =>
                                            updateScore("B", "FirstFoul", -1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Minus}</button
                                    >
                                    <span class="font-medium text-zinc-700"
                                        >{scoreDataB.FirstFoul}</span
                                    >
                                    <button
                                        type="button"
                                        on:click={() =>
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
                                        on:click={() =>
                                            updateScore("B", "SecondScore", -1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Minus}</button
                                    >
                                    <span class="font-medium text-zinc-700"
                                        >{scoreDataB.SecondScore}</span
                                    >
                                    <button
                                        type="button"
                                        on:click={() =>
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
                                        on:click={() =>
                                            updateScore("B", "SecondFoul", -1)}
                                        class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                        >{@html Minus}</button
                                    >
                                    <span class="font-medium text-zinc-700"
                                        >{scoreDataB.SecondFoul}</span
                                    >
                                    <button
                                        type="button"
                                        on:click={() =>
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
                                    on:click={() =>
                                        updateScore("B", "PenScore", -1)}
                                    class="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                                    >{@html Minus}</button
                                >
                                <span class="font-medium text-zinc-700"
                                    >{scoreDataB.PenScore}</span
                                >
                                <button
                                    type="button"
                                    on:click={() =>
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
                            class="w-full border border-zinc-200 p-[15px] rounded-[20px] gap-[5px] grid grid-cols-3"
                        >
                            {#each activeMatch.attendance.teamB as player}
                                <button
                                    type="button"
                                    on:click={() =>
                                        toggleCard("B", player.name)}
                                    class="bg-white border border-[#e4e4e7] border-solid content-stretch flex flex-col items-center justify-center px-[10px] py-[5px] relative rounded-[8px] transition-colors hover:bg-zinc-50"
                                >
                                    <p
                                        class="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[14px] whitespace-nowrap {cardsB[
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
                    on:click={() => (showStartConfirm = true)}
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
                    on:click={() => (showForfeitConfirm = true)}
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
                on:click={() => (showEndConfirm = true)}
                class="bg-zinc-500 hover:bg-zinc-600 active:bg-zinc-800 transition-colors content-stretch flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-[0.5rem] relative rounded-[0.9375rem] shrink-0 w-full disabled:opacity-50"
            >
                <p
                    class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-[1rem] text-white whitespace-nowrap"
                >
                    경기 종료하기
                </p>
            </button>
        {:else if activeMatch.status === "FINISHED"}
            <div
                class="bg-zinc-100 content-stretch flex flex-col h-[3.125rem] items-center justify-center px-[2.1875rem] py-[0.5rem] relative rounded-[0.9375rem] shrink-0 w-full"
            >
                <p
                    class="font-['Pretendard_Variable'] font-semibold leading-[normal] relative shrink-0 text-[1rem] text-zinc-500 whitespace-nowrap"
                >
                    종료된 경기입니다
                </p>
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
            class="bg-zinc-50 flex flex-col gap-2.5 items-center justify-center overflow-clip p-5 relative rounded-[20px] shadow-[0_0_30px_0_rgba(0,0,0,0.05)] shrink-0 w-[501px] max-w-full"
        >
            <div
                class="flex flex-col gap-5 items-center justify-center p-[50px] relative shrink-0 w-full text-center"
            >
                <p
                    class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-zinc-900 text-[24px]"
                >
                    정말로 기권패 / 몰수패 처리가 맞나요?
                </p>
                <p
                    class="font-['Pretendard_Variable'] font-medium relative shrink-0 text-zinc-600 text-[18px]"
                >
                    시스템 상 결과를 번복할 수 없습니다.
                </p>
            </div>
            <div
                class="flex gap-2.5 items-start justify-center relative shrink-0 w-full sm:flex-row flex-col"
            >
                <button
                    on:click={() => (showForfeitConfirm = false)}
                    class="bg-zinc-500 hover:bg-zinc-600 active:bg-zinc-800 transition-colors flex-1 flex flex-col h-[50px] items-center justify-center px-[35px] py-2 relative rounded-[15px] w-full"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-[16px] text-white whitespace-nowrap"
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
                        class="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-colors w-full flex flex-col h-[50px] items-center justify-center px-[35px] py-2 relative rounded-[15px] disabled:opacity-50"
                    >
                        <p
                            class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-[16px] text-white whitespace-nowrap"
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
            class="bg-zinc-50 flex flex-col gap-2.5 items-center justify-center overflow-clip p-5 relative rounded-[20px] shadow-[0_0_30px_0_rgba(0,0,0,0.05)] shrink-0 w-[501px] max-w-full"
        >
            <div
                class="flex flex-col gap-5 items-center justify-center p-[50px] relative shrink-0 w-full text-center"
            >
                <p
                    class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-zinc-900 text-[24px]"
                >
                    정말로 경기를 시작할까요?
                </p>
                <p
                    class="font-['Pretendard_Variable'] font-medium relative shrink-0 text-zinc-600 text-[18px]"
                >
                    시스템 상 결과를 번복할 수 없습니다.
                </p>
            </div>
            <div
                class="flex gap-2.5 items-center justify-center relative shrink-0 w-full sm:flex-row flex-col"
            >
                <button
                    on:click={() => (showStartConfirm = false)}
                    class="bg-zinc-500 hover:bg-zinc-600 active:bg-zinc-800 transition-colors flex-1 flex flex-col h-[50px] items-center justify-center px-[35px] py-2 relative rounded-[15px] w-full"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-[16px] text-white whitespace-nowrap"
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
                        class="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-colors flex-1 flex flex-col h-[50px] items-center justify-center px-[35px] py-2 relative rounded-[15px] w-full disabled:opacity-50"
                    >
                        <p
                            class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-[16px] text-white whitespace-nowrap"
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
            class="bg-zinc-50 flex flex-col gap-2.5 items-center justify-center overflow-clip p-5 relative rounded-[20px] shadow-[0_0_30px_0_rgba(0,0,0,0.05)] shrink-0 w-[569px] max-w-full"
        >
            <div
                class="flex flex-col items-center justify-center p-[50px] pb-[50px] relative shrink-0 w-full text-center"
            >
                <p
                    class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-zinc-900 text-[24px]"
                >
                    정말로 경기가 끝났나요?
                </p>
                <div
                    class="flex flex-col mt-5 gap-1.5 items-center justify-center"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-medium relative shrink-0 text-zinc-600 text-[18px]"
                    >
                        시스템 상 결과를 번복할 수 없습니다.
                    </p>
                    <p
                        class="font-['Pretendard_Variable'] font-medium relative shrink-0 text-red-600 text-[18px] break-keep leading-tight"
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
                    on:click={() => (showEndConfirm = false)}
                    class="bg-zinc-500 hover:bg-zinc-600 active:bg-zinc-800 transition-colors flex-1 flex flex-col h-[50px] items-center justify-center px-[35px] py-2 relative rounded-[15px] w-full"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-[16px] text-white whitespace-nowrap"
                    >
                        돌아가기
                    </p>
                </button>
                <button
                    disabled={isSubmitting}
                    on:click={() => {
                        showEndConfirm = false;
                        const form = document.querySelector(
                            "#finalizeForm",
                        ) as HTMLFormElement | null;
                        if (form) form.requestSubmit();
                    }}
                    class="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-colors w-full flex-1 flex flex-col h-[50px] items-center justify-center px-[35px] py-2 relative rounded-[15px] disabled:opacity-50"
                >
                    <p
                        class="font-['Pretendard_Variable'] font-semibold relative shrink-0 text-[16px] text-white whitespace-nowrap"
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
