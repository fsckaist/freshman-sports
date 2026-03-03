<script lang="ts">
    import ProfileCard from "$lib/components/dashboard/ProfileCard.svelte";
    import ClassInfoCard from "$lib/components/dashboard/ClassInfoCard.svelte";
    import ScheduleCard from "$lib/components/schedule/ScheduleCard.svelte";

    let { data } = $props();
</script>

<div
    class="flex flex-[1_0_0] gap-[1.875rem] items-start min-h-px min-w-px h-full relative w-full"
>
    <!-- Left Column (Profile & Class Info) -->
    <div
        class="flex flex-[1_0_0] flex-col gap-[1.875rem] h-full items-start relative hide-scrollbar"
    >
        <ProfileCard
            name={data?.user?.username || "DummyName"}
            studentNumber={data?.user?.studentNumber || "20260000"}
            userId={data?.user?.userId}
            phone={data?.user?.phoneNumber || "010-0000-0000"}
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
                class="font-pretendard font-bold leading-[normal] shrink-0 text-zinc-600 text-[1.5rem] m-0"
            >
                경기 일정
            </h2>
            <div
                class="flex flex-[1_0_0] h-px items-center justify-center min-w-px relative"
            >
                <div
                    class="flex-none w-full bg-zinc-300 h-[1px] rounded-full"
                ></div>
            </div>
        </div>

        <!-- Scrollable Cards Container -->
        <div
            class="bg-neutral-50 flex flex-[1_0_0] flex-col gap-[0.625rem] items-start min-h-px min-w-px p-[1.25rem] rounded-[1.25rem] shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] w-full relative hide-scrollbar overflow-auto"
        >
            {#if data.schedules && data.schedules.length > 0}
                {#each data.schedules as schedule}
                    <ScheduleCard {...schedule} />
                {/each}
            {:else}
                <div
                    class="flex items-center justify-center w-full h-full text-zinc-500 font-pretendard"
                >
                    예정된 경기가 없습니다.
                </div>
            {/if}
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
