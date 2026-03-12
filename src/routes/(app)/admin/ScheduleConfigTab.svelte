<script lang="ts">
    import ScheduleSelectionGrid from "$lib/components/schedule/ScheduleSelectionGrid.svelte";

    let {
        sports = [],
        activeSportId = null,
        gridData = {},
    }: {
        sports: any[];
        activeSportId: string | null;
        gridData: Record<string, any[]>;
    } = $props();
</script>

<div
    class="flex flex-col bg-white rounded-[1.25rem] w-full flex-[1_0_0] relative overflow-hidden shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] h-full"
>
    <!-- Sport Selection Tabs (Secondary) -->
    <div class="flex items-center shrink-0 w-full border-b border-zinc-200">
        {#each sports as sport, i}
            <a
                href="?sportId={sport.id}"
                class="flex flex-[1_0_0] items-center justify-center h-[3.125rem] cursor-pointer outline-none transition-colors duration-200 no-underline
                {activeSportId === sport.id
                    ? 'bg-amber-50 text-amber-600 zinc-800 border-amber-500'
                    : 'bg-white hover:bg-zinc-50 text-zinc-600 zinc-800 border-transparent'}
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

    <!-- Configuration Header -->
    <div
        class="flex justify-between items-center px-[1.875rem] py-4 shrink-0 border-b border-zinc-100"
    >
        <div class="flex flex-col">
            <h2
                class="font-pretendard font-bold text-zinc-800 text-[1.25rem] m-0"
            >
                종목별 일정 세팅
            </h2>
            <p
                class="font-pretendard font-normal text-zinc-500 text-[0.875rem] m-0 mt-1"
            >
                타임 블록을 클릭하여 활성화 여부를 조절할 수 있습니다.
            </p>
        </div>
    </div>

    <!-- Grid Container -->
    <div class="flex flex-row flex-[1_0_0] w-full min-h-0 overflow-hidden">
        <div
            class="flex-1 flex flex-col overflow-auto w-0 min-w-0 min-h-0 relative py-2"
        >
            {#if Object.keys(gridData).length === 0}
                <div
                    class="flex items-center justify-center w-full h-full py-12"
                >
                    <p
                        class="font-pretendard font-normal text-zinc-400 text-[0.875rem] m-0 text-center"
                    >
                        현재 저장된 일정이 없습니다.
                    </p>
                </div>
            {:else}
                <div class="w-full h-fit p-[1.875rem]">
                    <div class="w-fit mx-auto">
                        <ScheduleSelectionGrid
                            {gridData}
                            currentUserClassId={null}
                            minPlayers={0}
                            isDisabled={false}
                            isAdmin={true}
                        />
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
