<script lang="ts">
    import chevronDownIcon from "@gravity-ui/icons/svgs/chevron-down.svg?raw";
    import { slide } from "svelte/transition";

    let {
        classNumber = "99",
        proctors = "없음",
        rosters = [],
    } = $props<{
        classNumber?: string;
        proctors?: string;
        rosters?: Array<{ sport: string; players: string }>;
    }>();

    let isCollapsed = $state(false);
</script>

<div
    class="flex lg:flex-[1_0_0] flex-col gap-[0.625rem] items-start lg:min-h-0 min-w-px relative w-full"
>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- Title Area -->
    <div
        class="flex gap-[0.625rem] items-center justify-center shrink-0 w-full relative cursor-pointer group"
        onclick={() => (isCollapsed = !isCollapsed)}
    >
        <h2
            class="font-pretendard font-bold text-zinc-600 dark:text-zinc-400 text-[1.5rem] leading-[normal] shrink-0 m-0"
        >
            내 새터반 정보
        </h2>
        <div
            class="flex items-center justify-center size-8 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-all {isCollapsed ? '' : 'rotate-180'}"
        >
            {@html chevronDownIcon}
        </div>
        <div
            class="flex flex-[1_0_0] h-[1px] items-center justify-center min-w-px relative bg-zinc-300 dark:bg-zinc-700 rounded-full"
        ></div>
    </div>

    {#if !isCollapsed}
        <div 
            transition:slide={{ duration: 300 }}
            class="flex flex-col gap-[0.625rem] w-full lg:flex-1 lg:min-h-0"
        >
            <!-- Class Details Header Card -->
            <div
                class="bg-white dark:bg-zinc-900 flex font-pretendard font-normal items-stretch leading-[normal] overflow-clip rounded-[1.25rem] shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] dark:shadow-none shrink-0 text-base md:text-[1.125rem] w-full relative"
            >
                <!-- Left Categories -->
                <div
                    class="bg-neutral-50 dark:bg-zinc-800/50 border-r border-zinc-200 dark:border-zinc-800 flex flex-col gap-[0.9375rem] items-end justify-center overflow-clip pl-8 md:pl-[3.125rem] pr-[1.25rem] py-[1.25rem] shrink-0 text-zinc-600 dark:text-zinc-400"
                >
                    <p class="shrink-0 m-0">새터반</p>
                    <p class="shrink-0 m-0">프락터</p>
                </div>

                <!-- Right Info -->
                <div
                    class="flex flex-[1_0_0] flex-col gap-[0.9375rem] items-start justify-center min-w-px overflow-clip p-[1.25rem] text-zinc-800 dark:text-zinc-200 font-medium"
                >
                    <p class="shrink-0 m-0">{classNumber}반</p>
                    <p class="shrink-0 m-0">{proctors}</p>
                </div>
            </div>

            <!-- Roster Grid Card -->
            <div
                class="bg-neutral-50 dark:bg-zinc-900/50 flex flex-col gap-[0.625rem] items-start min-w-px p-[1.25rem] shadow-[0px_0px_1.875rem_0px_rgba(0,0,0,0.05)] dark:shadow-none rounded-[1.25rem] w-full relative overflow-hidden lg:flex-1 lg:min-h-0"
            >
                <div class="flex items-center justify-center px-[0.3125rem] shrink-0">
                    <h3
                        class="font-pretendard font-normal leading-[normal] shrink-0 text-zinc-600 dark:text-zinc-400 text-base md:text-[1.125rem] m-0"
                    >
                        출전 선수
                    </h3>
                </div>

                <div
                    class="w-full h-[1px] shrink-0 relative bg-zinc-200 dark:bg-zinc-800 rounded-full"
                ></div>

                <div
                    class="grid grid-cols-1 sm:grid-cols-2 gap-[0.625rem] md:gap-[0.9375rem] w-full relative mt-[0.3125rem] lg:overflow-y-auto lg:hide-scrollbar lg:flex-1"
                >
                    {#if rosters && rosters.length > 0}
                        {#each rosters as roster}
                            <!-- Individual Sport Roster Card -->
                            <div
                                class="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex flex-col gap-[0.625rem] items-center justify-center overflow-clip p-[1.25rem] rounded-[1.25rem] w-full relative"
                            >
                                <h4
                                    class="font-pretendard font-medium leading-[normal] shrink-0 text-zinc-800 dark:text-zinc-100 text-base md:text-[1.125rem] m-0 text-center"
                                >
                                    {roster.sport}
                                </h4>
                                <div
                                    class="w-full h-[1px] shrink-0 relative bg-zinc-100 dark:bg-zinc-700 rounded-full"
                                ></div>
                                {#if roster.players && roster.players !== "출전 선수가 없어요."}
                                    <p
                                        class="font-pretendard font-normal leading-[1.5rem] shrink-0 text-zinc-600 dark:text-zinc-400 text-[0.875rem] text-center whitespace-pre-wrap m-0 w-full"
                                    >
                                        {roster.players}
                                    </p>
                                {:else}
                                    <p
                                        class="font-pretendard font-normal leading-[1.5rem] shrink-0 text-zinc-400 dark:text-zinc-500 text-[0.875rem] text-center m-0 w-full"
                                    >
                                        출전 선수가 없어요.
                                    </p>
                                {/if}
                            </div>
                        {/each}
                    {:else}
                        <div
                            class="sm:col-span-2 flex items-center justify-center w-full py-8 text-zinc-500 font-pretendard font-normal"
                        >
                            등록된 선수가 없어요.
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</div>
