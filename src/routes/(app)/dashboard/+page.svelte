<script lang="ts">
    import ProfileCard from "$lib/components/dashboard/ProfileCard.svelte";
    import ClassInfoCard from "$lib/components/dashboard/ClassInfoCard.svelte";
    import ScheduleCard from "$lib/components/schedule/ScheduleCard.svelte";
    import noticeIconSvg from "@gravity-ui/icons/svgs/circle-exclamation.svg?raw";

    let { data } = $props();
</script>

<div class="flex flex-col gap-[1.25rem] w-full h-full relative">
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

    <!-- Original Horizontal Layout -->
    <div
        class="flex flex-[1_0_0] gap-[1.875rem] items-start min-h-px min-w-px relative w-full h-full"
    >
        <!-- Left Column (Profile & Class Info) -->
        <div
            class="flex flex-[1_0_0] flex-col gap-[1.875rem] h-full items-start relative hide-scrollbar"
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
            class="flex flex-1 flex-col gap-[0.625rem] items-start relative w-full h-full"
        >
            <!-- Title Area -->
            <div
                class="flex gap-[0.625rem] items-center justify-center shrink-0 w-full relative"
            >
                <h2
                    class="font-pretendard font-bold leading-[normal] shrink-0 text-zinc-600 dark:text-zinc-400 text-[1.5rem] m-0"
                >
                    경기 일정
                </h2>
                <div
                    class="flex flex-[1_0_0] h-px items-center justify-center min-w-px relative"
                >
                    <div
                        class="flex-none w-full bg-zinc-300 dark:bg-zinc-700 h-[1px] rounded-full"
                    ></div>
                </div>
            </div>

            <!-- Scrollable Cards Container -->
            <div
                class="bg-zinc-50 dark:bg-zinc-900/50 flex flex-[1_0_0] flex-col gap-[0.625rem] items-start min-h-px min-w-px p-[1.25rem] rounded-[1.25rem] shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] dark:shadow-none w-full relative hide-scrollbar overflow-auto"
            >
                {#if data.confirmedSchedules && data.confirmedSchedules.length > 0}
                    {#each data.confirmedSchedules as schedule}
                        <ScheduleCard {...schedule} />
                    {/each}
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    /* Hide scrollbar for layout columns to match Figma's seamless look while still allowing scroll */
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
