<script lang="ts">
    import ScheduleSelectionGrid from "$lib/components/schedule/ScheduleSelectionGrid.svelte";
    import triangleExclamationSvg from "@gravity-ui/icons/svgs/triangle-exclamation.svg?raw";
    import type { PageData } from "./$types";

    let { data } = $props<{ data: PageData }>();

    function resizeSvg(svgString: string) {
        return svgString
            .replace(/width="16"/g, 'width="18"')
            .replace(/height="16"/g, 'height="18"');
    }
</script>

<div
    class="flex flex-col gap-6 md:gap-[1.5625rem] h-full items-start min-h-px min-w-px w-full relative"
>
    <!-- Header -->
    <div
        class="flex flex-col gap-[0.625rem] items-start justify-center relative shrink-0 w-full"
    >
        <h1
            class="font-pretendard font-bold relative shrink-0 text-zinc-800 dark:text-zinc-100 text-[1.75rem] md:text-[2rem] m-0 leading-tight"
        >
            일정 정하기
        </h1>
        <div
            class="font-pretendard font-normal relative shrink-0 text-zinc-600 dark:text-zinc-400 text-sm md:text-[0.875rem] m-0 leading-tight"
        >
            <p class="m-0">
                아래 선택지 중 가능한 시간을 최대한 많이 선택해 주세요. 최소
                참여 인원수 이상이 선택해야 경기가 성사될 수 있어요.
            </p>
            <p class="m-0">
                많은 사람이 참여하는 만큼 일정을 선택할 때 체육대회를 우선으로
                생각해주세요.
            </p>
        </div>
    </div>

    <!-- Main Card Container -->
    <div
        class="flex flex-col bg-white dark:bg-zinc-900 rounded-[1.25rem] w-full gap-[1.25rem] pb-[1.25rem] flex-1 relative overflow-hidden shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] dark:shadow-none"
    >
        <!-- Tabs -->
        <div class="flex items-stretch shrink-0 w-full overflow-x-auto hide-scrollbar border-b border-zinc-200 dark:border-zinc-800">
            {#each data.sports as sport, i}
                <a
                    href="?sportId={sport.id}"
                    class="flex flex-1 items-center justify-center p-2 min-h-[3.125rem] cursor-pointer outline-none border-t-0 border-l-0 border-solid transition-colors duration-200 no-underline
                {data.activeSportId === sport.id
                        ? 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100'
                        : 'bg-zinc-100 dark:bg-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}
                {i !== data.sports.length - 1
                        ? 'border-r border-zinc-200 dark:border-zinc-800'
                        : 'border-r-0'}"
                >
                    <p
                        class="font-pretendard font-semibold text-[0.9375rem] md:text-[1rem] m-0 transition-colors duration-200 break-keep whitespace-normal text-center"
                    >
                        {sport.name}
                    </p>
                </a>
            {/each}
        </div>

        <!-- Grid Container -->
        <div
            class="flex flex-[1_0_0] flex-col overflow-y-auto w-full px-[1.875rem] py-[0px] min-h-0 justify-center"
        >
            {#if !data.isEligible}
                <div
                    class="flex items-center justify-center w-full h-full py-12"
                >
                    <p
                        class="font-pretendard font-normal text-zinc-400 dark:text-zinc-500 text-[0.875rem] m-0 text-center"
                    >
                        해당 종목의 출전 선수가 아니에요.<br />
                        출전 선수만 일정을 선택할 수 있어요.
                    </p>
                </div>
            {:else if !data.hasPendingMatch}
                <div
                    class="flex items-center justify-center w-full h-full py-12"
                >
                    <p
                        class="font-pretendard font-normal text-zinc-400 dark:text-zinc-500 text-[0.875rem] m-0 text-center"
                    >
                        현재 조율 가능한 매치가 없습니다.
                    </p>
                </div>
            {:else if data.isWindowUndetermined}
                <div
                    class="flex items-center justify-center w-full h-full py-12"
                >
                    <p
                        class="font-pretendard font-normal text-zinc-400 dark:text-zinc-500 text-[0.875rem] m-0 text-center"
                    >
                        상대편 매치 일정이 아직 확정되지 않아<br />
                        일정 선택 마감 기한이 정해지지 않았습니다.
                    </p>
                </div>
            {:else if Object.keys(data.gridData).length === 0}
                <div
                    class="flex items-center justify-center w-full h-full py-12"
                >
                    <p
                        class="font-pretendard font-normal text-zinc-400 dark:text-zinc-500 text-[0.875rem] m-0 text-center"
                    >
                        {data.deadlinePassed
                            ? "등록된 일정 슬롯이 없습니다."
                            : "등록된 일정 슬롯이 없습니다."}
                    </p>
                </div>
            {:else}
                <div class="py-6 flex flex-col items-center gap-6">
                    <div class="mx-auto w-fit">
                        <ScheduleSelectionGrid
                            gridData={data.gridData}
                            currentUserClassId={data.currentUserClassId}
                            opponentClassId={data.opponentClassId}
                            isOpponentUndecided={data.isOpponentUndecided}
                            minPlayers={data.minPlayers}
                            isDisabled={data.deadlinePassed}
                        />
                    </div>
                </div>
            {/if}
        </div>

        <!-- Bottom Text -->
        <div
            class="flex items-center justify-center shrink-0 w-full px-[0.625rem]"
        >
            {#if data.isEligible && data.hasPendingMatch && data.deadlineAt && !data.isWindowUndetermined}
                <p
                    class="font-pretendard font-normal text-[0.875rem] text-zinc-600 dark:text-zinc-400 m-0"
                >
                    {#if !data.deadlinePassed}
                        '{data.sports.find(
                            (s: any) => s.id === data.activeSportId,
                        )?.name ?? "해당 종목"}' 일정 정하기는 {data.deadlineAt}까지
                        할 수 있어요. 마감까지 {data.timeRemaining} 남았어요.
                    {:else}
                        <span class="text-red-500 dark:text-red-400 font-bold"
                            >일정 정하기가 마감되었어요</span
                        >
                    {/if}
                </p>
            {/if}
        </div>
    </div>
</div>
