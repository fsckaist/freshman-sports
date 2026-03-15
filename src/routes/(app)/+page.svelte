<script lang="ts">
    import ProfileCard from "$lib/components/dashboard/ProfileCard.svelte";
    import ClassInfoCard from "$lib/components/dashboard/ClassInfoCard.svelte";
    import ScheduleCard from "$lib/components/schedule/ScheduleCard.svelte";
    import noticeIconSvg from "@gravity-ui/icons/svgs/circle-exclamation.svg?raw";
    import chevronDownIcon from "@gravity-ui/icons/svgs/chevron-down.svg?raw";
    import { slide } from "svelte/transition";

    let { data } = $props();
    let isScheduleCollapsed = $state(false);
</script>

<div class="flex flex-col gap-8 md:gap-[1.25rem] w-full lg:h-full relative">
    <!-- Notice Card on top -->
    {#if data.pendingMatches && data.pendingMatches.length > 0}
        <div class="flex flex-col gap-[0.625rem] shrink-0 w-full">
            <div
                class="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-[1.25rem] p-[1rem] flex items-center gap-[0.3rem] w-full shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] dark:shadow-none"
            >
                <!-- Notice Icon -->
                <div
                    class="flex items-center justify-center shrink-0 w-[1.5rem] h-[1.5rem] text-red-800 dark:text-red-400"
                >
                    {@html noticeIconSvg}
                </div>

                <div class="flex flex-col">
                    <h3
                        class="font-pretendard font-regular text-red-800 dark:text-red-400 text-[1rem] m-0 leading-tight"
                    >
                        <span class="font-bold">
                            {Array.from(
                                new Set(
                                    data.pendingMatches.map((m) => m.sportName),
                                ),
                            ).join(", ")}
                        </span> 일정을 정할 수 있어요. 일정 정하기에서 가능한 시간을
                        선택해주세요.
                    </h3>
                </div>
            </div>
        </div>
    {/if}

    <!-- Main Layout: Vertical on mobile, Horizontal on desktop -->
    <div
        class="flex flex-col lg:flex-row lg:flex-1 gap-6 md:gap-[1.875rem] items-start min-h-px min-w-px relative w-full lg:h-full"
    >
        <!-- Left Column (Profile & Class Info) -->
        <div
            class="flex lg:flex-1 flex-col gap-6 md:gap-[1.875rem] lg:h-full items-start relative lg:hide-scrollbar w-full"
        >
            <ProfileCard
                name={data?.dashboardUser?.username || "DummyName"}
                studentNumber={data?.dashboardUser?.studentNumber || "20260000"}
                userId={data?.dashboardUser?.userId}
                phone={data?.dashboardUser?.phoneNumber || "010-0000-0000"}
                sports={data?.dashboardUser?.sports || "참여 종목 없음"}
            />
            <ClassInfoCard
                classNumber={data?.classInfo?.classNumber?.toString() || ""}
                proctors={data?.classInfo?.proctors || "없음"}
                rosters={data?.classInfo?.rosters || []}
            />
        </div>

        <!-- Right Column (Schedules) -->
        <div
            class="flex lg:flex-1 flex-col gap-[0.625rem] items-start relative w-full lg:h-full"
        >
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <!-- Title Area -->
            <div
                class="flex gap-[0.625rem] items-center justify-center shrink-0 w-full relative cursor-pointer group"
                onclick={() => (isScheduleCollapsed = !isScheduleCollapsed)}
            >
                <h2
                    class="font-pretendard font-bold leading-[normal] shrink-0 text-zinc-600 dark:text-zinc-400 text-[1.5rem] m-0"
                >
                    경기 일정
                </h2>
                <div
                    class="flex items-center justify-center size-8 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-all {isScheduleCollapsed ? '' : 'rotate-180'}"
                >
                    {@html chevronDownIcon}
                </div>
                <div
                    class="flex flex-[1_0_0] h-px items-center justify-center min-w-px relative"
                >
                    <div
                        class="flex-none w-full bg-zinc-300 dark:bg-zinc-700 h-[1px] rounded-full"
                    ></div>
                </div>
            </div>

            <!-- Scrollable Cards Container -->
            {#if !isScheduleCollapsed}
                <div
                    transition:slide={{ duration: 300 }}
                    class="bg-zinc-50 dark:bg-zinc-900/50 flex flex-col gap-[0.625rem] items-start min-h-px min-w-px p-4 md:p-[1.25rem] rounded-[1.25rem] shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] dark:shadow-none w-full relative lg:hide-scrollbar overflow-auto lg:flex-1"
                >
                    {#if data.confirmedSchedules && data.confirmedSchedules.length > 0}
                        {#each data.confirmedSchedules as schedule}
                            <ScheduleCard {...schedule} />
                        {/each}
                    {:else}
                        <div class="flex items-center justify-center w-full py-12 text-zinc-500 font-pretendard">
                            확정된 경기 일정이 없습니다.
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    /* Hide scrollbar for layout columns on desktop to match Figma's seamless look */
    @media (min-width: 1024px) {
        .lg\:hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .lg\:hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    }
</style>
