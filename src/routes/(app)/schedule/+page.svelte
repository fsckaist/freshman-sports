<script lang="ts">
    import ScheduleSelectionGrid from "$lib/components/schedule/ScheduleSelectionGrid.svelte";
    import type { PageData } from "./$types";

    let { data } = $props<{ data: PageData }>();
</script>

<div
    class="flex flex-col gap-[1.5625rem] h-full items-start min-h-px min-w-px w-full relative"
>
    <!-- Header -->
    <div
        class="flex flex-col gap-[0.625rem] items-start justify-center relative shrink-0 w-full"
    >
        <h1
            class="font-pretendard font-bold relative shrink-0 text-zinc-800 text-[2rem] m-0 leading-tight"
        >
            일정 정하기
        </h1>
        <div
            class="font-pretendard font-normal relative shrink-0 text-zinc-600 text-[0.875rem] whitespace-nowrap m-0 leading-tight"
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
        class="flex flex-col bg-white rounded-[1.25rem] w-full gap-[1.25rem] pb-[1.25rem] flex-[1_0_0] relative overflow-hidden shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)]"
    >
        <!-- Tabs -->
        <div class="flex items-center shrink-0 w-full">
            {#each data.sports as sport, i}
                <a
                    href="?sportId={sport.id}"
                    class="flex flex-[1_0_0] items-center justify-center h-[3.125rem] cursor-pointer outline-none border-t-0 border-l-0 border-b border-solid transition-colors duration-200 no-underline
                {data.activeSportId === sport.id
                        ? 'bg-white border-white text-zinc-600'
                        : 'bg-zinc-100 hover:bg-zinc-300 active:bg-zinc-400 border-zinc-200 text-zinc-600'}
                {i !== data.sports.length - 1
                        ? 'border-r border-zinc-200'
                        : 'border-r-0'}"
                >
                    <p
                        class="font-pretendard font-semibold text-[1rem] m-0 transition-colors duration-200"
                    >
                        {sport.name}
                    </p>
                </a>
            {/each}
        </div>

        <!-- Grid Container -->
        <div
            class="flex flex-[1_0_0] flex-col overflow-y-auto w-full px-[1.875rem] py-[0px] min-h-0"
        >
            {#if data.isEligible}
                <ScheduleSelectionGrid
                    gridData={data.gridData}
                    currentUserClassId={data.currentUserClassId}
                    minPlayers={data.minPlayers}
                />
            {:else}
                <div
                    class="flex items-center justify-center w-full h-full py-12"
                >
                    <p
                        class="font-pretendard font-normal text-zinc-400 text-[0.875rem] m-0 text-center"
                    >
                        해당 종목의 출전 선수가 아니에요.<br />
                        출전 선수만 일정을 선택할 수 있어요.
                    </p>
                </div>
            {/if}
        </div>

        <!-- Bottom Text -->
        <div
            class="flex items-center justify-center shrink-0 w-full px-[0.625rem]"
        >
            {#if data.isEligible}
                <p
                    class="font-pretendard font-normal text-[0.875rem] text-zinc-600 m-0"
                >
                    '{data.sports.find(
                        (s: { id: string; name: string }) =>
                            s.id === data.activeSportId,
                    )?.name ?? "해당 종목"}' 일정 정하기는 {data.deadlineDate} 23:59까지
                    할 수 있어요. 마감까지 {data.hoursRemaining}시간 남았어요.
                </p>
            {/if}
        </div>
    </div>
</div>
