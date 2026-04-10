<script lang="ts">
    import personSvg from "@gravity-ui/icons/svgs/person.svg?raw";
    import skullSvg from "@gravity-ui/icons/svgs/skull.svg?raw";
    import { i18n } from "$lib/i18n.svelte";

    let {
        isAvailable = true,
        isVoted = false,
        ourCount = 0,
        ourMax = 5,
        oppCount = 0,
        oppMax = 5,
        participantNames = [],
        isDisabled = false,
        isAdmin = false,
        scheduledMatchesCount = 0,
        maxParallelMatches = 1,
        isOpponentUndecided = false,
        isConfirmMode = false,
        isScheduledMatchSlot = false,
        isLoading = false,
        onSlotClick = undefined,
    } = $props<{
        isAvailable?: boolean;
        isVoted?: boolean;
        ourCount?: number;
        ourMax?: number;
        oppCount?: number;
        oppMax?: number;
        participantNames?: string[];
        isDisabled?: boolean;
        isAdmin?: boolean;
        isOpponentUndecided?: boolean;
        isConfirmMode?: boolean;
        isScheduledMatchSlot?: boolean;
        scheduledMatchesCount?: number;
        maxParallelMatches?: number;
        isLoading?: boolean;
        onSlotClick?: (e: MouseEvent) => void;
    }>();

    // Scale down SVGs slightly for compactness
    const resizeSvg = (svg: string) =>
        svg
            .replace(/width="16"/g, 'width="14"')
            .replace(/height="16"/g, 'height="14"');

    // Derived states mapping to the old UI logic
    let isEmpty = $derived(!isAvailable);
    let isOurTeamAvailable = $derived(ourCount >= ourMax);
    let isOppTeamAvailable = $derived(oppCount >= oppMax);
    let isMatchAvailable = $derived(isOurTeamAvailable && isOppTeamAvailable);
    let isParticipating = $derived(isVoted);

    // Text for tooltip or name list
    let namesTooltip = $derived(
        participantNames.length > 0
            ? participantNames.join(", ")
            : i18n.t({ ko: "참여자 없음", en: "No participants" }),
    );

    function cx(classes: (string | boolean | undefined | null)[]) {
        return classes.filter(Boolean).join(" ");
    }

    let isAtLimit = $derived(scheduledMatchesCount >= maxParallelMatches);
</script>

<button
    type={onSlotClick ? "button" : "submit"}
    onclick={onSlotClick}
    title={namesTooltip}
    class="flex relative shrink-0 h-[5rem] aspect-square rounded-[1.5625rem] border border-solid overflow-hidden select-none outline-none p-0 transition-opacity duration-200
    {cx([
        !isAdmin ? 'flex-col' : 'items-center justify-center',
        (isEmpty && !isAdmin) ||
        isDisabled ||
        (isAdmin && isEmpty && !isAtLimit)
            ? 'border-zinc-300 dark:border-zinc-800'
            : '',
        isAdmin && isEmpty && isAtLimit ? 'border-red-400' : '',
        (!isEmpty || isAdmin) &&
        !isDisabled &&
        !(isAdmin && isEmpty && !isAtLimit) &&
        !(isAdmin && isEmpty && isAtLimit) &&
        !isScheduledMatchSlot
            ? 'border-amber-500 dark:border-zinc-600 cursor-pointer hover:opacity-60 active:opacity-30'
            : '',
        isScheduledMatchSlot
            ? 'border-red-500 bg-red-50 dark:bg-red-950/20 dark:border-red-500 cursor-pointer hover:opacity-80'
            : '',
        isEmpty && isAdmin && !isScheduledMatchSlot
            ? 'bg-zinc-100 dark:bg-zinc-900'
            : '',
        !isEmpty && isAdmin && !isScheduledMatchSlot
            ? 'bg-amber-50 dark:bg-amber-950/20'
            : '',
        isAdmin && isEmpty && isAtLimit ? 'disabled' : '',
    ])}"
    disabled={(isEmpty && !isAdmin) ||
        isDisabled ||
        (isAdmin && isEmpty && isAtLimit)}
>
    <!-- Loading Overlay -->
    {#if isLoading}
        <div class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-black/60">
            <svg class="animate-spin h-6 w-6 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    {/if}

    <!-- ADMIN MODE: Minimal Block -->
    {#if isAdmin}
        <div
            class="flex flex-col items-center justify-center gap-1 w-full h-full"
        >
            <span
                class="font-pretendard font-bold text-[0.875rem]
                {cx([
                    !isEmpty
                        ? 'text-amber-500'
                        : 'text-zinc-400 dark:text-zinc-500',
                ])}"
            >
                {isEmpty
                    ? i18n.t({ ko: "비활성화", en: "Disabled" })
                    : i18n.t({ ko: "활성화", en: "Active" })}
            </span>
            <span
                class="font-pretendard font-medium text-[0.625rem] text-zinc-400 dark:text-zinc-500"
            >
                ({scheduledMatchesCount}/{maxParallelMatches})
            </span>
        </div>
    {:else}
        <!-- USER MODE -->
        {#if !isEmpty}
            <!-- VS Badge Area -->
            <div
                class="flex items-center justify-center w-full py-[0.25rem] shrink-0 border-b
                {cx([
                    !isMatchAvailable
                        ? 'border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50'
                        : 'border-amber-500 bg-amber-400',
                ])}"
            >
                <div
                    class="flex items-center justify-center px-[0.3125rem] py-px rounded-[0.3125rem]
                    {cx([
                        !isMatchAvailable
                            ? 'bg-zinc-300 dark:bg-zinc-800'
                            : 'bg-amber-300',
                    ])}"
                >
                    <p
                        class="font-pretendard font-extrabold text-[0.75rem] text-white m-0 leading-[0.75rem] tracking-wide
                        {cx([
                            !isMatchAvailable && !isScheduledMatchSlot
                                ? 'dark:text-zinc-500'
                                : 'dark:text-white',
                            isScheduledMatchSlot
                                ? 'text-red-600 dark:text-red-400'
                                : '',
                        ])}"
                    >
                        VS
                    </p>
                </div>
            </div>

            <!-- Metrics Area -->
            <div
                class="flex flex-[1_0_0] w-full min-h-0 {isScheduledMatchSlot
                    ? 'bg-transparent'
                    : 'bg-white dark:bg-zinc-950'}"
            >
                <!-- Our Data -->
                <div
                    class="flex flex-[1_0_0] flex-col items-center justify-center gap-px h-full relative border-r border-solid border-zinc-300 dark:border-zinc-800"
                >
                    {#if !isConfirmMode}
                        <div
                            class="flex items-center justify-center leading-none w-[0.75rem] h-[0.75rem]
                            {cx([
                                isOurTeamAvailable
                                    ? 'text-amber-500'
                                    : 'text-zinc-400 dark:text-zinc-500',
                            ])}"
                        >
                            {@html resizeSvg(personSvg)}
                        </div>
                    {/if}
                    <div
                        class="flex items-center font-pretendard leading-none gap-px font-semibold text-[1rem]"
                    >
                        <span class="text-zinc-800 dark:text-zinc-200"
                            >{ourCount}</span
                        >
                        <span class="text-zinc-400 dark:text-zinc-500"
                            >/{ourMax}</span
                        >
                    </div>
                </div>

                <!-- Opponent Data -->
                <div
                    class="flex flex-[1_0_0] flex-col items-center justify-center gap-px h-full relative"
                >
                    {#if !isConfirmMode}
                        <div
                            class="flex items-center justify-center leading-none w-[0.75rem] h-[0.75rem]
                            {cx([
                                isOppTeamAvailable
                                    ? 'text-amber-500'
                                    : 'text-zinc-400 dark:text-zinc-500',
                            ])}"
                        >
                            {@html resizeSvg(skullSvg)}
                        </div>
                    {/if}
                    <div
                        class="flex items-center font-pretendard leading-none gap-px font-semibold text-[1rem]"
                    >
                        {#if isOpponentUndecided}
                            <span class="text-zinc-600 dark:text-zinc-400"
                                >?</span
                            >
                        {:else}
                            <span class="text-zinc-800 dark:text-zinc-200"
                                >{oppCount}</span
                            >
                        {/if}
                        <span class="text-zinc-400 dark:text-zinc-500"
                            >/{oppMax}</span
                        >
                    </div>
                </div>
            </div>

            <!-- Action / Status Background Footer -->
            {#if !isDisabled && !isConfirmMode}
                <div
                    class="flex items-center justify-center w-full py-[0.25rem] shrink-0 border-t border-solid transition-colors duration-200
                    {cx([
                        isParticipating
                            ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-500'
                            : 'bg-zinc-100 dark:bg-zinc-900/50 border-zinc-300 dark:border-zinc-800',
                    ])}"
                >
                    <p
                        class="font-pretendard text-[0.75rem] font-semibold m-0 leading-tight flex items-center justify-center gap-1
                        {cx([
                            isParticipating
                                ? 'text-amber-500'
                                : 'text-zinc-400 dark:text-zinc-500',
                        ])}"
                    >
                        {isParticipating
                            ? i18n.t({ ko: "참여", en: "In" })
                            : i18n.t({ ko: "미참여", en: "Out" })}
                    </p>
                </div>
            {/if}
        {:else}
            <!-- EMPTY USER MODE -->
            <div class="w-full h-full bg-white dark:bg-zinc-900"></div>
        {/if}
    {/if}
</button>
